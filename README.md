# tosleuth

## Setting up 
### Set up backend server
1. Install [Python](https://www.python.org/downloads/release/python-3115/)
2. Do `git clone https://github.com/mad-cat-lon/tosleuth` and do `cd tosleuth`
3. Do `cd core`
4. Do `pip install -r requirements.txt` and follow the installation steps 

### Set up extension
1. `cd extension`
2. `npm install`
3. When you want to generate a production build for testing in Firefox, do `npm run build`


## Running the Firefox extension 
Go to `about:debugging#/runtime/this-firefox`
Click "Load temporary addon"
Navigate to the extension folder (under `/extensions`)
Click `manifest.json`
The extension should be loaded until the browser is restarted

## Running the backend server 
`cd core`

`uvicorn server:app`

You can make requests to 127.0.0.1:8000 using [Postman](https://www.postman.com/)

![Sending requests to the backend with Postman](https://github.com/mad-cat-lon/tosleuth/assets/113548315/40486ea5-8bec-4217-b4d0-cca3cca78582)

## File structure 
There are two main components to our product: the frontend, which is the browser extension, and the backend, which contains the embedding database, web server and code to run the model. The extension makes requests from the web server and uses the responses to display data to the user. Currently, only the server portion is functional (only analyzing 1 file for testing purposes)

