from tosleuth import TOSleuth
from pathlib import Path

def main():
    path = Path(__file__).parent.joinpath("reddit_tos.txt")
    tos = TOSleuth()
    tos.load_from_file(path, "all")
    while True:
        query = input("> ")
        tos.query(query)

if __name__ == "__main__":
    main()

