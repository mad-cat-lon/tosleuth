from pydantic import BaseModel
from typing import Union, List


class URL(BaseModel):
    url: str


class SourceDocument(BaseModel):
    service: str
    url: str
    name: str
    text: str


class LLMQuery(BaseModel):
    tosdr_cases: List[str]
    service: Union[str, None]
    doc_name: Union[str, None]
