from bs4 import BeautifulSoup 

def remove_html_tags(text: str) -> str:
    """
    Removes unwanted HTML tags from a string
    """
    cleaned = BeautifulSoup(text, 'lxml').text
    print(cleaned)
    return cleaned 