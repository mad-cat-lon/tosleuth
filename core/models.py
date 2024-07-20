from pydantic import BaseModel
from typing import Union, List, Dict


class URL(BaseModel):
    url: str


class ScrapedURLs(BaseModel):
    urls: List[str]
    source_url: str
    
    
class SourceDocument(BaseModel):
    service: str
    url: str
    name: str
    text: str


class LLMQuery(BaseModel):
    tosdr_cases: List[Dict[str, str]]
    service: Union[str, None]
    doc_name: Union[str, None]
