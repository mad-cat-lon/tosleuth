from rag import VectorStore
from pathlib import Path
import logging 


def main():
    logging.basicConfig(level=logging.INFO)
    path = Path(__file__).parent.joinpath("reddit_tos.txt")
    storage = VectorStore()
    storage.load_from_file(path, "all")
    while True:
        query = input("> ")
        storage.query(query.split("-"))


if __name__ == "__main__":
    main()

# You can opt out of promotional communications - You sign away moral rights
