# tosleuth

## Setting up 
1. Install [pyenv](https://blog.teclado.com/how-to-use-pyenv-manage-python-versions/) by following this guide. Pyenv lets us isolate different versions of Python/packages for each project. Make sure to install version 3.9.13
2. Do `git clone https://github.com/mad-cat-lon/tosleuth` and do `cd tosleuth`
3. Do `pyenv shell 3.9.13`
4. Do `cd core`
5. Do `pip install -r requirements.txt` and follow the installation steps 

## Playing around with the vector DB
Run `testing.py` to see how embeddings are retrieved! This code initializes our vector store and allows us to query it interactively. Enter some text and see what snippets of text are returned - play around with the different parameters in `rag.py`, along with the chunking in `utils/chunking.py` to see how it affects the search results

## Running the backend server 
`cd core`

`uvicorn server:app`

You can make requests to 127.0.0.1:8000 using [Postman](https://www.postman.com/)

![Making requests to the backend](https://imgur.com/a/8dDdDNT)
## File structure 
There are two main components to our product: the frontend, which is the browser extension, and the backend, which contains the embedding database, web server and code to run the model. The extension makes requests from the web server and uses the responses to display data to the user. Currently, only the server portion is functional (only analyzing 1 file for testing purposes)

