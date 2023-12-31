import logging
import chromadb
import utils


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
        client = chromadb.PersistentClient(path="vecdb")
        self.collection = client.get_or_create_collection("vecdb")
        self.documents = []
        self.metadatas = []
        self.ids = []
        self.id = 0
        self.index = 0
        
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

    def load_from_text(self, service, url, name, text):
        print(f"Adding document {name} from service {service} to vectorDB...")
        logging.info(f"Reading text {name} from {service}")
        # Add name and source_service to metadata later 
        chunks = utils.chunk_raw_text_by_newline(text)
        metadatas = [{"name": name, "service": service, "url": url} for _ in chunks]
        self.add_to_collection(chunks, metadatas)
        print(f"Succesfully added document {name} from service {service} to vectorDB")

    def load_from_file(self, file_path: str, file_name):
        with open(file_path, "r", encoding="utf-8") as f:
            logging.info(f"Reading file {file_path}")
            chunks = utils.chunk_raw_text_by_newline(f.read())
            metadatas = []
            self.add_to_collection(chunks, metadatas)
    
    def query(self, query_texts, n_results=4, where=None, where_document=None, include=["documents"]):
        """
        Just a wrapper around ChromaDB's query for now
        """
        results = self.collection.query(
            query_texts=query_texts,
            n_results=n_results,
            where=where,
            where_document=where_document,
            include=include
        )
        # for doc in results["documents"]:
        #     print("="*40)
        #     print(f"{len(doc)} results:")
        #     for index, option in enumerate(doc):
        #         print(f"({index+1}) {option}")
        #     print("="*40)
        return results
    

