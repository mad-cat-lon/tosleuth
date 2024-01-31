# tosleuth

### Set up and run backend server

1. Install Docker from [this link](https://www.docker.com/products/docker-desktop/)
2. Open a terminal and do `git clone https://github.com/mad-cat-lon/tosleuth`
3. `cd tosleuth`
4. `docker compose up` to start the server, CTRL+C to stop the running server
5. If you have made changes and want to see them in the running server, do `docker compose up --build`
6. To stop the container run `docker compose down`

### Set up extension
1. `cd extension`
2. `npm install`
3. When you want to generate a production build for testing in Firefox, do `npm run build`


## Running the Firefox extension 
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load temporary addon"
3. Navigate to the extension build folder (under `/extensions/build`)
4. Click `manifest.json`
The extension should be loaded until the browser is restarted


![Sending requests to the backend with Postman](https://github.com/mad-cat-lon/tosleuth/assets/113548315/40486ea5-8bec-4217-b4d0-cca3cca78582)
