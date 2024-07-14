chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

function injectLinkFinder() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let currentTabId = tabs[0].id;
    console.log("Current Tab ID: ", currentTabId);
    chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ["/js/linkFinder.js"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error injecting scripts: ", chrome.runtime.lastError);
      }
    });
  });
}

function injectGetContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let currentTabId = tabs[0].id;
    console.log("Current Tab ID: ", currentTabId);
    chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ["/js/getContent.js"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error injecting scripts: ", chrome.runtime.lastError);
      }
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension initialized.");
});

let tosdr_cases = [];
const query_endpoint = 'http://127.0.0.1:8000/query';
const url_upload_endpoint = 'http://127.0.0.1:8000/add_from_url';
const content_upload_endpoint = 'http://127.0.0.1:8000/add';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Events from sidebar
  if (msg.action === 'autoAnalyze') {
    console.log('[!] autoAnalyze event received');
    injectLinkFinder();
  }

  if (msg.action === 'standardAnalyze') {
    console.log('[!] standardAnalyze event received');
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
      body: JSON.stringify(msg.urls.map(url => ({ url })))
    })
    .then(response => response.json())
    .then(data => {
      chrome.runtime.sendMessage({
        action: 'backendResponse',
        type: 'upload_url',
        error: false,
        service: msg.service,
        message: data.message
      });
      console.log("Response from backend received: ", data);
    })
    .catch(error => {
      chrome.runtime.sendMessage({
        action: 'backendResponse',
        type: 'upload_url',
        error: true,
        service: msg.service,
        message: error.message
      });
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
    .then(response => response.json())
    .then(data => {
      chrome.runtime.sendMessage({
        action: 'backendResponse',
        type: 'upload_content',
        error: false,
        name: msg.name,
        service: msg.service,
        url: msg.url,
        message: data.message
      });
      console.log("Response from backend received: ", data);
    })
    .catch(error => {
      chrome.runtime.sendMessage({
        action: 'backendResponse',
        type: 'upload_content',
        error: true,
        name: msg.name,
        service: msg.service,
        url: msg.url,
        message: data.message
      });
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
      .then(response => response.json())
      .then(data => {
        console.log("Response from backend received: ", data);
        let timeTaken = Date.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
        chrome.runtime.sendMessage({
          action: 'updateResults',
          data: data,
          source: msg.source
        });
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
    .then(response => response.json())
    .then(data => {
      console.log("Response from backend received: ", data);
      chrome.runtime.sendMessage({
        action: 'updateResults',
        data: data,
        source: msg.source
      });
    })
    .catch(error => {
      console.log("Error in fetching: ", error);
    });
  }
});