from fastapi import FastAPI, HTTPException
from rag import VectorStore
from typing import Union, List
from pydantic import BaseModel 
# from llama_cpp import Llama
from prompts import make_prompt
import json
import asyncio
import requests
import pprint

class URL(BaseModel):
    url: str

class RawDocument(BaseModel):
    source_service: str
    source_url: str
    name: str
    body: str


class RagQuery(BaseModel):
    query_texts: List[str]
    n_results: int
    where: Union[dict[str, str], None]
    where_document: Union[dict[str, str], None]
    

class LLMQuery(BaseModel):
    tosdr_cases: List[str]
    

# # Load our model
# llm = Llama(
#     model_path="models\mistral-7b-instruct-v0.1.Q5_K_M.gguf",
#     n_gpu_layers=6,
#     n_ctx=2048,
#     n_batch=512
# )
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


@app.post("/add_from_url", status_code=200)
async def add_raw_document_from_url(url: URL):
    """
    Gets a URL to a resource and retrieves the raw document
    """
    print(url.url)
    return {"message": "Success!"}


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
    # For each case, search the vector database for results
    query_response = await asyncio.to_thread(
        storage.query,
        query_texts=query.tosdr_cases,
        n_results=4
    )
    llm_response = {
        "results": []
    }
    print(query_response)
    # Now we go through each of the results
    # and insert the query text and results into the prompt
    for index, search_results in enumerate(query_response["documents"]):
        prompt = make_prompt(
            query_statement=query.tosdr_cases[index],
            vector_results=search_results
        )
        url = "https://api.fireworks.ai/inference/v1/chat/completions"

        payload = {
            "messages": [
                { 
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "top_p": 0.9,
            "n": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "stream": False,
            "max_tokens": 300,
            "stop": None,
            "prompt_truncate_len": 1500,
            "model": "accounts/fireworks/models/mistral-7b-instruct-4k"
        }
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": "Bearer 0QX3IdsrikDEomAyxHtKVcW7WA5a4WfC5IlJkb0jbB79YiKB"
        }

        response = requests.post(url, json=payload, headers=headers)
        try:
            response = json.loads(response.text)
            pprint.pprint(response)
            try:
                result = json.loads(response["choices"][0]["message"]["content"])
                # Extract which choice was returned so we can get the original text
                choice = result["choice"]
                print(search_results)
                source_text = search_results[choice-1] if choice != 0 else ""
                result["source_text"] = source_text
                result["tosdr_case"] = query.tosdr_cases[index]
            except json.JSONDecodeError as e:
                print(f"Error decoding the model response: {e}")
                result = {}
            llm_response["results"].append(result)
        except Exception as e:
            print(f"An error occurred while parsing the response from the remote server: {e}")
    return llm_response
    