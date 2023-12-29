from fastapi import FastAPI, HTTPException
from rag import VectorStore
from typing import Union, List
from pydantic import BaseModel 
import json
import asyncio
import requests
import pprint
# from playwright.async_api import async_playwright

from prompts import make_prompt
from scraper import scrape_raw_document_from_url
from utils.cleaning import remove_html_tags

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
storage = VectorStore()


@app.get("/")
async def root():
    return {"message": "Hello World!"}


@app.post("/add", status_code=200)
async def add_raw_document(raw_doc: RawDocument):
    """
    Adds a raw document to vector storage
    """
    clean_text = remove_html_tags(raw_doc.text)
    storage.load_from_text(
        raw_doc.service,
        raw_doc.url,
        raw_doc.name,
        clean_text
    )
    return {"message": "Added document to vector storage"}

@app.post("/add_from_url", status_code=200)
async def add_raw_document_from_url(url: URL):
    """
    Gets a URL to a resource and retrieves the raw document
    """
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
    # For each case, search the vector database for results
    # Filter by service name
    query_response = await asyncio.to_thread(
        storage.query,
        query_texts=query.tosdr_cases,
        # Only get documents that belong to the queried service
        # since we will have lots of different documents from diff services
        where={
            "service": query.service
        },
        n_results=4,
        # Return document metadata as well
        include=["documents", "metadatas"]
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
                # Get the metadata associated with the selected source document
            except json.JSONDecodeError as e:
                print(f"Error decoding the model response: {e}")
                result = {}
            result["source_doc"] = query_response["metadatas"][index][0]["name"]
            result["source_url"] = query_response["metadatas"][index][0]["url"]
            result["source_service"] = query_response["metadatas"][index][0]["service"]
            llm_response["results"].append(result)
        except Exception as e:
            print(f"An error occurred while constructing the response: {e}")
    return llm_response
    