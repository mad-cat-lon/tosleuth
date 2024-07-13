function injectLinkFinder() {
  browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
      let currentTabId = tabs[0].id;
      console.log("Current Tab ID: ", currentTabId);
      browser.tabs.executeScript({file: "/js/browser-polyfill.js"}).then(
        browser.tabs.executeScript(currentTabId, { file: '/js/linkFinder.js'})
      ).catch((error) => {
        console.error("Error getting the current tab ID: ", error);
      });
    }).catch((error) => {
      console.error(error);
    });
}

function injectGetContent() {
  browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
      let currentTabId = tabs[0].id;
      console.log("Current Tab ID: ", currentTabId);
      browser.tabs.executeScript({file: "/js/browser-polyfill.js"}).then(
        browser.tabs.executeScript(currentTabId, { file: '/js/getContent.js'})
      ).catch((error) => {
        console.error("Error getting the current tab ID: ", error);
      });
    }).catch((error) => {
      console.error(error);
    });
}

// function chunkArray(array, chunkSize) {
//   return array.reduce((result, item, index) => {
//     const chunkIndex = Math.floor(index / chunkSize);
//     if (!result[chunkIndex]) {
//       result[chunkIndex] = [];
//     }
//     result[chunkIndex].push(item);
//     return result;
//   }, []);
// }
browser.runtime.onInstalled.addListener(() => {
    console.log("Extension initialized.")
})

let tosdr_cases = [];
const query_endpoint = 'http://127.0.0.1:8000/query';
const url_upload_endpoint = 'http://127.0.0.1:8000/add_from_url';
const content_upload_endpoint = 'http://127.0.0.1:8000/add'

browser.runtime.onMessage.addListener((msg) => {
  // Events from sidebar
  if (msg.action === 'autoAnalyze') {
    console.log('[!] autoAnalyze event received');
    injectLinkFinder();
  }

  if (msg.action === 'standardAnalyze') {
    console.log('[!] standardAnalyze event received')
    injectGetContent(true);
  }

  if (msg.action === 'addContent') {
    console.log('[!] addContent event received');
    injectGetContent(false);
  }

  if (msg.action === 'addQueries') {
    console.log('[!] addQueries event received');
    tosdr_cases = msg.data;
  }

  if (msg.action === 'retrieveContent') {
    console.log('[!] retrieveContent event received');
    // send it to our backend server
    fetch(url_upload_endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'url': msg.source })
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log("Response from backend received: ", data);
    })
    .catch(error => {
      console.log("Error in fetching: ", error);
    });
  }

  if (msg.action === 'sendContent') {
    console.log('[!] sendContent event received');
    let start = Date.now();
    // send the raw HTML to our backend server
    fetch(content_upload_endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'service': msg.service,
        'url': msg.url,
        'name': msg.name,
        'text': msg.text
      })
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      browser.runtime.sendMessage({
        action: 'backendResponse',
        type: 'upload',
        error: false,
        name: msg.name,
        service: msg.service,
        url: msg.url,
      })
      console.log("Response from backend received: ", data);
    })
    .catch(error => {
      browser.runtime.sendMessage({
        action: 'backendResponse',
        type: 'upload',
        error: true,
        name: msg.name,
        service: msg.service,
        url: msg.url
      })
      console.log("Error in fetching: ", error);
    });
    // We can either add a page, or add a page and immediately query it
    if (msg.query_after === true) {
      // Send queries to backend server immediately after adding file
      fetch(query_endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'tosdr_cases': tosdr_cases,
          'service': msg.service
        })
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log("Response from backend received: ", data);
        let timeTaken = Date.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
        browser.runtime.sendMessage({
          action: 'updateResults',
          data: data,
          source: msg.source
        })
      })
      .catch(error => {
        console.log("Error in fetching: ", error);
      });
    }
  }

  // Send queries to docs already stored in backend
  if (msg.action === 'analyzeStoredContent') {
    console.log('[!] analyzeStoredContent event received');
    fetch(query_endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'tosdr_cases': tosdr_cases,
        'service': msg.service
      })
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log("Response from backend received: ", data);
      browser.runtime.sendMessage({
        action: 'updateResults',
        data: data,
        source: msg.source
      })
    })
    .catch(error => {
      console.log("Error in fetching: ", error);
    });
  }
})
