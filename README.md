# tosleuth

## Setting up 
1. Install [pyenv](https://blog.teclado.com/how-to-use-pyenv-manage-python-versions/) by following this guide. Pyenv lets us isolate different versions of Python/packages for each project. Make sure to install version 3.9.13
2. Do `git clone https://github.com/mad-cat-lon/tosleuth` and do `cd tosleuth`
3. Do `pyenv shell 3.9.13`
4. Do `cd core`
5. Do `pip install -r requirements.txt` and follow the installation steps 

## Playing around with the vector DB
Run `testing.py` to see how embeddings are retrieved! This code initializes our vector store and allows us to query it interactively. Enter some text and see what snippets of text are returned - play around with the different parameters in `rag.py`, along with the chunking in `utils/chunking.py` to see how it affects the search results

## Running the backend server PoC locally
If you want to do this, you must have a decent graphics card! If you have an Nvidia card, make sure to install the `llama_cpp` package with cuBLAS. If you have a Mac, install it with Metal. Follow this [guide](https://llama-cpp-python.readthedocs.io/en/latest/) - you may have to reinstall the package if you already ran `pip install -r requirements.txt`
1. Download the model [here](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/blob/main/mistral-7b-instruct-v0.1.Q5_K_M.gguf)
2. Place it in `core/models/`
3. `cd` into `/core` and do `uvicorn server:app` which will load the model into memory and start the backend server
4. You can make requests to the endpoints defined in `server.py` and play around with it as you wish!

## File structure 
There are two main components to our product: the frontend, which is the browser extension, and the backend, which contains the embedding database, web server and code to run the model. The extension makes requests from the web server and uses the responses to display data to the user. Currently, only the server portion is functional (only analyzing 1 file for testing purposes)

