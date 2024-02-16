function injectLinkFinder() {
  browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
      let currentTabId = tabs[0].id;
      console.log("Current Tab ID: ", currentTabId);
      browser.tabs.executeScript(currentTabId, { file: '../js/linkFinder.js' });        
    })
    .catch((error) => {
      console.error("Error getting the current tab ID: ", error);
    });
}

function injectGetContent() {
  browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
      let currentTabId = tabs[0].id;
      console.log("Current Tab ID: ", currentTabId);
      browser.tabs.executeScript(currentTabId, { file: '../js/getContent.js'})
    })
    .catch((error) => {
      console.error("Error getting the current tab ID: ", error);
    });
}

browser.runtime.onInstalled.addListener(() => {
    console.log("Extension initialized.")
})

browser.runtime.onMessage.addListener((msg) => {
  console.log(msg);
  // Events from sidebar
  if (msg.action === 'autoAnalyze') {
    console.log('[!] autoAnalyze event received');
    injectLinkFinder();
  }

  if (msg.action === 'standardAnalyze') {
    console.log('[!] standardAnalyze event received')
    injectGetContent();
  }

  if (msg.action === 'retrieveContent') {
    console.log('[!] retrieveContent event received');
    const url = 'http://127.0.0.1:8000/add_from_url';
    // send it to our backend server
    fetch(url, {
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
    const url = 'http://127.0.0.1:8000/add'
    // send the raw HTML to our backend server
    fetch(url, {
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
      console.log("Response from backend received: ", data);
    })
    .catch(error => {
      console.log("Error in fetching: ", error);
    });
    const query = 'http://127.0.0.1:8000/query';
    // send it to our backend server
    fetch(query, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify({ 'url': message.source })
      // Send test cases to backend server
      body: JSON.stringify( { 
        'tosdr_cases': [
        'Third-party cookies are used for advertising',
        'This service can share your personal information to third parties',
        'Tracking via third-party cookies for other purposes without your consent.'
        ],
        'service': msg.service
      })
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log("Response from backend received: ", data);
      // Send message to sidebar view to render the results from backend
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
