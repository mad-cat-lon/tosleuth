import logging
import chromadb
import utils 

class TOSleuth:
    def __init__(self, embedding_model=None):
        logging.info("[*] Initalizing in-memory client...")
        client = chromadb.Client()
        self.collection = client.get_or_create_collection("tos")
        self.documents = []
        self.metadatas = []
        self.ids = []
        self.id = 0
        self.index = 0

    def add_to_collection(self, documents, metadatas) -> None:
        for doc in documents:
            self.documents.append(doc)
            self.ids.append(str(self.id))
            self.id += 1
        for metadata in metadatas:
            self.metadatas.append(metadata)
        if not metadatas:
            self.collection.add(
                ids=self.ids[self.index:],
                documents=self.documents[self.index:]
            )
        else:
            self.collection.add(
                ids=self.ids[self.index:],
                documents=self.documents[self.index:],
                metadatas=self.metadatas[self.index:]
            )
        self.index += len(documents)
        logging.info(f"Added {len(documents)} to the collection.")

    def load_from_file(self, file_path: str, file_name):
        with open(file_path, "r", encoding="utf-8") as f:
            logging.info(f"[*] Reading file {file_path}")
            chunks, metadata = utils.chunk_raw_text_by_newline(f.read())
            self.add_to_collection(chunks, metadata)
    
    def query(self, query_str: str, n_results=5, where=None, where_document=None):
        result = self.collection.query(
            query_texts=[query_str],
            n_results=n_results,
            where=where,
            where_document=where_document
        )
        for doc in result["documents"]:
            print("="*40)
            print(f"{len(doc)} results:")
            for index, option in enumerate(doc):
                print(f"({index+1}) {option}")
        return result
    

