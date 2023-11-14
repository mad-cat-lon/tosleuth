# import chromadb
# client = chromadb.Client()
# from pathlib import Path

# collection = client.get_or_create_collection("tos")
# documents = []

# path = Path(__file__).parent.joinpath("reddit_tos.txt")
# with open(path, "r", encoding='utf-8') as f:
#     lines = f.readlines()
#     for line in lines:
#         documents.append(str(line))
# id = 0
# ids = [str(i) for i in range(0, len(documents))]
# collection.add(ids=ids, documents=documents)
from rag import VectorStore

vdb = VectorStore()

while True:
    query = input("> ")
    results = vdb.query(
        query_texts=[query],
        n_results=4
    )
    print("="*30)
    for doc in results["documents"]:
        print(f"{len(doc)} results:")
        for i, snippet in enumerate(doc):
            print(f"{i+1}) {snippet}")
    print("="*30)

