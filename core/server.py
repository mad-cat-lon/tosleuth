from fastapi import FastAPI, HTTPException
from rag import VectorStore
from typing import Union, List
from pydantic import BaseModel 
from llama_cpp import Llama
from prompts import make_prompt


class RawDocument(BaseModel):
    source_service: str
    name: str
    body: str


class RagQuery(BaseModel):
    query_texts: List[str]
    n_results: int
    where: Union[dict[str, str], None]
    where_document: Union[dict[str, str], None]
    

class LLMQuery(BaseModel):
    tosdr_point_texts: List[str]
    

# Load our model
llm = Llama(
    model_path="models\mistral-7b-instruct-v0.1.Q5_K_M.gguf",
    n_gpu_layers=6,
    n_ctx=2048,
    n_batch=512
)
app = FastAPI()
storage = VectorStore()


@app.get("/")
async def root():
    return {"message": "Active!"}


@app.post("/add", status_code=200)
async def add_raw_document(raw_doc: RawDocument):
    """
    Adds a raw document to vector storage
    """
    storage.load_from_text(
        raw_doc.body,
        raw_doc.name,
        raw_doc.source_service
    )
    return {"message": "Added document to vector storage"}


@app.post("/rag_query", status_code=200)
async def make_rag_query(query: RagQuery):
    results = storage.query(
        query_texts=query.query_texts,
        n_results=query.n_results,
        where=query.where,
        where_document=query.where_document
    )
    return results

@app.post("/query", status_code=200)
async def make_query(query: LLMQuery):
    # For each point, search the vector database for results
    query_response = storage.query(
        query_texts=query.tosdr_point_texts,
        n_results=4
    )
    print(query_response)
    llm_response = {
        "results": []
    }
    # Now we go through each of the results
    # and insert the query text and results into the prompt
    for index, search_results in enumerate(query_response["documents"]):
        prompt = make_prompt(
            query_statement=query.tosdr_point_texts[index],
            vector_results=search_results
        )
        print(prompt)
        response = llm(
            prompt=prompt,
            max_tokens=2048,
            temperature=0.3,
            top_p=0.9,
            top_k=20,
            stop=["</s>"]
        )
        print(response)
        llm_response["results"].append(response)
    return llm_response
    