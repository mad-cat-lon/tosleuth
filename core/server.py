from fastapi import FastAPI, HTTPException
from typing import Union, List
import json
import asyncio
import chromadb
from dotenv import load_dotenv
from playwright.async_api import async_playwright
import tldextract
# from sentence_transformers import CrossEncoder

from langchain.vectorstores import Chroma
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.document_transformers import Html2TextTransformer
from langchain.schema.document import Document
from langchain.llms.fireworks import Fireworks
from langchain.text_splitter import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter, MarkdownTextSplitter
from fastapi.middleware.cors import CORSMiddleware

from prompts import RAGQueryPromptTemplate
from models import URL, SourceDocument, LLMQuery

app = FastAPI()
# storage = VectorStore()

origins = ["*"]

# CORS Protection
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
print("Setting up vector store...")
# Handling vector store
# Initialize persistent client and collection 
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path="vecdb")
collection = client.get_or_create_collection("vecdb")
db = Chroma(
    client=client,
    collection_name="vecdb",
    embedding_function=embedding_function
)
# reranker_model = CrossEncoder(model_name="BAAI/bge-reranker-large", max_length=512)
print("Loaded vector store...")
fireworks_models = {
    # Smallest model, semi-functional
    "zephyr-3b": "accounts/stability/models/stablelm-zephyr-3b",
    # Decent functionality, poor accuracy
    "zephyr-7b": "accounts/fireworks/models/zephyr-7b-beta",
    # Expensive and capable Mixtral finetune
    "firefunction": "accounts/fireworks/models/firefunction-v1"
}
llm = Fireworks(
    model=fireworks_models["firefunction"],
    model_kwargs={
        "temperature": 0.1,
        "max_tokens": 150,
        "top_p": 1.0,
        "response_format": {
            "type": "json_object",
            "schema": """{
                "type": "object",
                "properties": {
                "choice": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 4
                },
                "reason": {
                    "maxLength": 500,
                    "type": "string"
                },
                "answer": {
                    "type": "boolean"
                }
                },
                "required": [
                    "choice",
                    "reason",
                    "answer"
                ]
            }"""
        }
    }
)


@app.post("/add", status_code=200)
async def add_src_document(src_doc: SourceDocument):
    """
    Gets a SourceDocument object from user's POST request body
    containing the raw HTML of the page, parses it, chunks it
    and vectorizes it
    """
    print(f"Adding {src_doc.name} from {src_doc.service}")
    # Check if source document already exists in our db
    query_response = await asyncio.to_thread(
        db.get,
        where={
            "$or": [
                {
                    "url": src_doc.url
                },
                {
                    "$and": [
                        {
                            "name": src_doc.name
                        },
                        {
                            "service": src_doc.service
                        }
                    ]
                }
            ],
        }
    )
    if query_response["documents"]:
        raise HTTPException(status_code=400, detail={"message": f"Document {src_doc.url} for service {src_doc.service} already exists in the database"})
    
    # Create Langchain Document object from our request
    original_doc = Document(
        page_content=src_doc.text,
        metadata={
            "service": src_doc.service,
            "url": src_doc.url,
            "name": src_doc.name
        } 
    )
    # Turn HTML of page into markdown
    html2text = Html2TextTransformer()
    md_doc = html2text.transform_documents([original_doc])[0]

    # Break down markdown text by header and include into metadata
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3")
    ]
    md_header_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on
    )
    split_by_headers = md_header_splitter.split_text(md_doc.page_content)
    
    # Go through each markdown chunk and recursively split
    recursive_char_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=250,
        length_function=len,
        separators=["\n\n", "\n", ""],
        is_separator_regex=False,
    )
    final_chunks = recursive_char_splitter.split_documents(split_by_headers)
    db.add_texts(
        texts=[chunk.page_content for chunk in final_chunks],
        # Add the original document metadata containing service, url and name
        metadatas=[{**original_doc.metadata, **chunk.metadata} for chunk in final_chunks]
    )
    return {"message": f"Successfully added document {src_doc.name} from {src_doc.service} to the vector store."}


async def scrape_raw_document_from_url(browser, url, service):
    try:
        page = await browser.new_page()
        await page.goto(url)
        html = await page.content()
        # Only get the domain without subdomain to avoid cases
        # where the service would be "github.com" but source doc links
        # are in "docs.github.com" 
        name = await page.title()
        src_doc = SourceDocument(
            service=service,
            url=url,
            name=name,
            text=html
        )
        try:
            await add_src_document(src_doc)
            return True
        except HTTPException:
            return False
    except Exception:
        return False

@app.post("/add_from_url", status_code=200)
async def add_src_document_from_url(urls: List[URL]):
    """
    Gets a URL to a resource and retrieves the raw document
    """
    # Assuming all the docs will have the same domain
    service = tldextract.extract(urls[0].url).registered_domain
    succeeded = 0
    async with async_playwright() as p:
        browser = await p.firefox.launch(headless=True)
        for url in urls:
            if await scrape_raw_document_from_url(browser, url.url, service):
                succeeded += 1
    return {
        "message": f"Discovered and processed {succeeded}/{len(urls)} documents in {service}",
        "service": service
        }

    
@app.post("/query", status_code=200)
async def make_query(query: LLMQuery):
    """
    Takes an LLMQuery object in user POST request body, searches the vector DB
    with user-specified query strings, calls our inference API and returns
    results
    """
    extension_response = {
        "results": []
    }
    print(query)
    # For each case, search the vector database for results
    for query_text in query.tosdr_cases:
        result = {}
        query_response = await asyncio.to_thread(
            db.similarity_search,
            query=query_text,
            k=4,
            filter={"service": query.service},
            include=["documents", "metadatas"]
        )
        # print(query_response)
        if len(query_response) < 4:
            result["error"] = 0
            extension_response["results"].append(result)            
            continue
        # For each returned text from the vector store, insert into prompt,
        # send to model and parse response
        template = RAGQueryPromptTemplate(
            input_variables=[
                "query",
                "result1",
                "result2",
                "result3",
                "result4"
            ]
        )
        prompt = template.format(
            query=query_text,
            results=[doc.page_content for doc in query_response]
        )
        # print("="*100)
        # print(prompt)
        # print("="*100)

        llm_response = llm(prompt)
        print(llm_response)
        try:
            response = json.loads(llm_response)
            # Extract the choice
            choice = response["choice"]
            chosen_doc = query_response[choice-1]
            source_text = chosen_doc.page_content if choice != 0 else ""
            # TODO: Fix field duplication later
            result["source_text"] = source_text
            result["tosdr_case"] = query_text
            result["source_doc"] = chosen_doc.metadata["name"]
            result["source_url"] = chosen_doc.metadata["url"]
            result["source_service"] = chosen_doc.metadata["service"]
            result["reason"] = response["reason"]
            result["answer"] = response["answer"]
            if source_text:
                result["error"] = None
            else:
                # Model chose 0 
                result["error"] = 1
        except json.JSONDecodeError:
            print(f"Error decoding response from model")
            result["error"] = 2
        extension_response["results"].append(result)
    return extension_response
           
