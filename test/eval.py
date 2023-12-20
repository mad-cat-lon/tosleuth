import requests
import json
import pprint
import time 


def get_all_cases():
    """
    Retrieves all cases from TOSDR and converts to JSON 
    """
    cases_endpoint = "https://api.tosdr.org/case/v1/"
    response = requests.get(cases_endpoint)
    cases = json.loads(response.text)["parameters"]["cases"]
    return cases 


def get_all_services():
    """
    Retrieves all services from TOSDR and converts to JSON
    https://developers.tosdr.org/dev/get-service-v2
    """
    services_endpoint = "https://api.tosdr.org/service/v2"
    services = []
    # Pagination is enabled on this API so we can only get 100 at a time
    # Find how many pages we need first
    response = requests.get(services_endpoint)
    print(response.text)
    start = json.loads(response.text)["parameters"]["_page"]["start"]
    end = json.loads(response.text)["parameters"]["_page"]["end"]
    for i in range(start, end+1):
        print(f"Retrieving page {i} of {end} from API...")
        response = requests.get(services_endpoint, params={"page": i})
        print(response.text)
        current_services = json.loads(response.text)["parameters"]["services"]
        # Filter services that would not offer useful data:
        # is_comprehensively_reviewed = False 
        # rating = null
        services += [
            service for service in current_services
            if (
                service["is_comprehensively_reviewed"]
                and service["rating"]
            )
        ]
        # sleep so we don't get banned 
        time.sleep(2)
    print(len(services))


get_all_services()