function getBrowser() {
  const userAgent = navigator.userAgent;

  if (userAgent.indexOf("Firefox") !== -1) {
    return "Firefox";
  } else if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Edge") === -1) {
    // Chrome's user agent contains "Chrome" and does not include "Edge"
    return "Chrome";
  } else {
    return "Unknown";
  }
}
const userBrowser = getBrowser();
console.log("Current browser is: " + userBrowser);

if (userBrowser == "Chrome") {
  // Open the chrome side panel
  chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  });
}

function injectLinkFinder() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let currentTabId = tabs[0].id;
    console.log("Current Tab ID: ", currentTabId);
    if (userBrowser == "Chrome") {
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        files: ["/js/linkFinder.js"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error injecting scripts: ", chrome.runtime.lastError);
        }
      });
    }
    else if (userBrowser == "Firefox") {
      browser.tabs.executeScript(currentTabId, { file: '/js/linkFinder.js'})
      .then(() => {
        console.log("Script injected successfully.");
      }).catch((error) => {
        console.error("Error injecting scripts: ", error);
      });
    }
  });
}

function injectGetContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let currentTabId = tabs[0].id;
    console.log("Current Tab ID: ", currentTabId);
    if (userBrowser == "Chrome") {
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        files: ["/js/getContent.js"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error injecting scripts: ", chrome.runtime.lastError);
        }
      });
    }
    else if (userBrowser == "Firefox") {
      browser.tabs.executeScript(currentTabId, { file: '/js/getContent.js'})
      .then(() => {
        console.log("Script injected successfully.");
      }).catch((error) => {
        console.error("Error injecting scripts: ", error);
      });
    }
  });
}

function chunkArray(array, chunkSize) {
  return array.reduce((result, item, index) => {
    const chunkIndex = Math.floor(index / chunkSize);
    if (!result[chunkIndex]) {
      result[chunkIndex] = [];
    }
    result[chunkIndex].push(item);
    return result;
  }, []);
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
    .then(response => {
      if (!response.ok) {
        return response.json().then(error =>  {
          throw new Error(error.detail.message);
        });
      }
      return response.json();
    })
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
      console.log(error);
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
    .then(response => {
      if (!response.ok) {
        return response.json().then(error =>  {
          throw new Error(error.detail.message);
        });
      }
      return response.json();
    })
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
        message: error.message
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
    if (tosdr_cases.length === 0) {
      chrome.runtime.sendMessage({
        action: 'backendResponse',
        error: true,
        message: 'Select 1 or more analysis categories'
      });
      return;
    }
    console.log('[!] analyzeStoredContent event received');
    // chunk cases so user spends less time waiting
    let chunked_cases = chunkArray(tosdr_cases, 3)
    let promises = []
    for (let i=0; i<chunked_cases.length; i++) {
      let promise = fetch(query_endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'tosdr_cases': chunked_cases[i],
          'service': msg.service
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Response from backend received: ", data);
        chrome.runtime.sendMessage({
          action: 'updateResults',
          data: data,
          source: msg.source,
        });
      })
      .catch(error => {
        console.log("Error in fetching: ", error);
      });
      promises.push(promise)
    }
    Promise.all(promises)
    .then(() => {
      console.log("All requests have been finished.");
      chrome.runtime.sendMessage({
        action: 'backendResponse',
        error: false,
        message: 'Analysis completed successfully'
      });
    })
    .catch(error => {
      console.log("One or more requests failed: ", error);
      chrome.runtime.sendMessage({
        action: 'backendResponse',
        error: true,
        message: 'One or more requests failed'
      });
    });
  }
});