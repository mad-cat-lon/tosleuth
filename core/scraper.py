from urllib.parse import urlparse
from utils.cleaning import remove_html_tags


async def scrape_raw_document_from_url(browser, url):
    """
    Opens the URL in the headless browser and scrapes text
    """
    page = await browser.new_page()
    await page.goto(url)
    content = await page.content()
    
    # Extract the domain from the url and make it the service name
    service = urlparse(url).netloc
    print(f"Service: {service}")

    # Extract document name from the title
    name = await page.title()
    print(f"Name: {name}")

    text = remove_html_tags(content)
    
    return service, url, name, text