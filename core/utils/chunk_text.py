from bs4 import BeautifulSoup

def chunk_raw_text_by_newline(text: str) -> tuple:
    """
    Chunks raw input text by newline 
    """
    return text.split("\n"), {}

def extract_metadata_from_html(text: str) -> tuple:
    """
    Extracts useful infornation from the raw HTML
    to be returned as metadata for better semantic search
    and context during inference
    """
    