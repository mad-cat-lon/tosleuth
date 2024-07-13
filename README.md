# tosleuth

### Set up and run backend server

1. Install Docker from [this link](https://www.docker.com/products/docker-desktop/)
2. Open a terminal and do `git clone https://github.com/mad-cat-lon/tosleuth`
3. `cd tosleuth`
4. `docker compose build` to build the server image
5. `docker compose up` to start the server, CTRL+C to stop the running server
6. If you have made changes and want to see them in the running server, do `docker compose up --build`
7. To stop the container run `docker compose down`

Alternatively, you can try the following at your own risk:

1. `cd core`
2. `pip install -r requirements.txt`
3. `uvicorn server:app`

### Set up extension
1. `cd extension`
2. `npm install`
3. Build instructions:
    - For Firefox Manifest v2, do `npm run build:firefox`
    - For Chrome Manifest v3, do `npm run build:chrome`

## Running the Chrome extension
1. Go to `chrome://extensions/`
2. Click "Load unpacked"
3. Navigate to the build folder (under `/extension/build`)
4. Select the folder
You should see the side panel open and the extension loaded

## Running the Firefox extension 
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load temporary addon"
3. Navigate to the extension build folder (under `/extension/build`)
4. Click `manifest.json`
The extension should be loaded until the browser is restarted


# Goals
- ~Move to Manifest v3~
- ~Cross-platform compatibility~
- Simplify architecture (run vectorDB in extension itself)