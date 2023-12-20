import logging
import chromadb
import utils
import fireworks.client


class VectorStore:
    """
    Thin wrapper around ChromaDB that allows us to embed documents and add
    them to a vector database and query them 
    https://docs.trychroma.com/usage-guide

    Attributes:
        collection: The stored embeddings 
        documents: Documents stored in raw text form
        metadatas: Information associated with documents (i.e type of agreement, etc.), currently unused
        ids: List of all unique document ids
        id: Current document id counter 
        index: Current document index 

    """
    def __init__(self, embedding_model=None):
        logging.info("Initalizing in-memory client...")
        client = chromadb.Client()
        self.collection = client.get_or_create_collection("tos")
        self.documents = []
        self.metadatas = []
        self.ids = []
        self.id = 0
        self.index = 0
        # Normally we would call add_to_collection() after initializing
        # VectorStore, but here we just automatically ingest a single 
        # TOS document for testing purposes 
        from pathlib import Path
        path = Path(__file__).parent.joinpath("facebook_tos.txt")
        with open(path, "r", encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines:
                self.documents.append(str(line))
            ids = [str(i) for i in range(0, len(self.documents))]
            self.collection.add(ids=ids, documents=self.documents)
        print("Loaded file.")
        
    def add_to_collection(self, documents, metadatas) -> None:
        """
        Adds documents and their associated metadatas to the collection.

        Args:
            documents: A list of strings containing the documents
            metadatas: A list of dictionaries containing the document metadatas
        """
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

    def load_from_text(self, text, name, source_service):
        logging.info(f"Reading text {name} from {source_service}")
        # Add name and source_service to metadata later 
        chunks, metadatas = utils.chunk_raw_text_by_newline(text)
        self.add_to_collection(chunks, metadatas)

    def load_from_file(self, file_path: str, file_name):
        with open(file_path, "r", encoding="utf-8") as f:
            logging.info(f"Reading file {file_path}")
            chunks, metadatas = utils.chunk_raw_text_by_newline(f.read())
            self.add_to_collection(chunks, metadatas)
    
    def query(self, query_texts, n_results=4, where=None, where_document=None):
        """
        Just a wrapper around ChromaDB's query for now
        """
        results = self.collection.query(
            query_texts=query_texts,
            n_results=n_results,
            where=where,
            where_document=where_document
        )
        # for doc in results["documents"]:
        #     print("="*40)
        #     print(f"{len(doc)} results:")
        #     for index, option in enumerate(doc):
        #         print(f"({index+1}) {option}")
        #     print("="*40)
        return results
    

