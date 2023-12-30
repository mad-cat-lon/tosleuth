from fastapi import FastAPI, HTTPException
from rag import VectorStore
from typing import Union, List
from pydantic import BaseModel 
import json
import asyncio
import requests
import chromadb
import pprint
import os
# from playwright.async_api import async_playwright

from langchain.vectorstores import Chroma
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.document_transformers import Html2TextTransformer
from langchain.schema.document import Document
from langchain.llms.fireworks import Fireworks
from langchain.text_splitter import CharacterTextSplitter

from prompts import RAGQueryPromptTemplate

class URL(BaseModel):
    url: str


class RawDocument(BaseModel):
    service: str
    url: str
    name: str
    text: str


class LLMQuery(BaseModel):
    tosdr_cases: List[str]
    service: Union[str, None]
    doc_name: Union[str, None]


app = FastAPI()
# storage = VectorStore()

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

print("Loaded vector store...")

# Handling fireworks API
# We can change the key later, just easier for dev
if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = "0QX3IdsrikDEomAyxHtKVcW7WA5a4WfC5IlJkb0jbB79YiKB"
llm = Fireworks(
    model="accounts/fireworks/models/mistral-7b-instruct-4k",
    model_kwargs={
        "temperature": 0.1,
        "max_tokens": 100,
        "top_p": 1.0
    }
)


@app.get("/")
async def root():
    return {"message": "Hello World!"}


@app.post("/add", status_code=200)
async def add_raw_document(raw_doc: RawDocument):
    """
    Adds a raw document to vector storage
    """
    # Create Langchain Document object from our request
    doc = Document(
        page_content=raw_doc.text,
        metadata ={
            "service": raw_doc.service,
            "url": raw_doc.url,
            "name": raw_doc.name
        } 
    )
    # Remove the HTML
    html2text = Html2TextTransformer()
    cleaned_html = html2text.transform_documents([doc])[0]
    # Just split by newlines for now 
    splitter = CharacterTextSplitter(
        separator = "\n",
        chunk_size = 500,
        chunk_overlap  = 200,
        length_function = len,
        is_separator_regex = False,
    )

    texts = splitter.split_documents([cleaned_html])
    db.add_texts(
        texts=[doc.page_content for doc in texts],  
        metadatas=[doc.metadata for doc in texts]
    )
    return {"message": f"Successfully added document {raw_doc.name} from {raw_doc.service} to the vector store."}




@app.post("/add_from_url", status_code=200)
async def add_raw_document_from_url(url: URL):
    """
    Gets a URL to a resource and retrieves the raw document
    """
    # TODO: Finish this later with langchain's built in loaders 
    # https://python.langchain.com/docs/modules/data_connection/document_loaders/
    print(url.url)
    # async with async_playwright() as p:
    #     browser = await p.firefox.launch(headless=True)
    #     service, url, name, text = await scrape_raw_document_from_url(browser, url.url)
    #     storage.load_from_text(
    #         service,
    #         url,
    #         name,
    #         text
    #     )
    # return {"message": f"Scraped document from {url} and added to vector storage"}


@app.post("/query", status_code=200)
async def make_query(query: LLMQuery):

    extension_response = {
        "results": []
    }

    # For each case, search the vector database for results
    for query_text in query.tosdr_cases:
        query_response = await asyncio.to_thread(
            db.similarity_search,
            query=query_text,
            k=4,
            filter={"service": query.service},
            include=["documents", "metadatas"]
        )
        print(query_response)
        # For each returned text from the vector store, insert into prompt,
        # send to model and parse response
        template = RAGQueryPromptTemplate(
            input_variables=["query", "result1", "result2", "result3", "result4"]
        )
        prompt = template.format(
            query=query_text,
            results=[doc.page_content for doc in query_response]
        )
        # print(prompt)
        llm_response = llm(prompt)
        print(llm_response)
        result = {}
        try:
            response = json.loads(llm_response)
            # Extract the choice
            choice = response["choice"]
            chosen_doc = query_response[choice-1]
            source_text = chosen_doc if choice != 0 else ""
            # TODO: Fix field duplication later
            result["source_text"] = source_text.page_content
            result["tosdr_case"] = query_text
            result["source_doc"] = chosen_doc.metadata["name"]
            result["source_url"] = chosen_doc.metadata["url"]
            result["source_service"] = chosen_doc.metadata["service"]
            if source_text:
                result["found"] = True
            else:
                result["found"] = False
        except json.JSONDecodeError:
            print(f"Error decoding response from model")
            result["found"] = False
        extension_response["results"].append(result)
    return extension_response
           