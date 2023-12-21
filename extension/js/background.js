browser.runtime.onInstalled.addListener(() => {
    console.log("Extension initialized.")
})
// const seen = [];
// // Listen for any tab updates
// browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     // Check if the tab's status is 'complete' which means the page and its scripts have loaded
//     console.log(seen);
//     if (changeInfo.status === 'complete' && tab.active && tab.highlighted) {
//       let domain = (new URL(tab.url)).hostname;
//       console.log(domain);
//       if (!(seen.includes(domain))) {
//         // Inject the content script into the current page
//         browser.tabs.executeScript(tabId, { file: 'content.js' });
//         seen.push(domain)
//       }
//       else {
//         console.log('Skipping domain');
//       }
//   }
// });


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'download') {
    // Create a new file blob with the text data
    const blob = new Blob([message.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Use the downloads API to download the file
    browser.downloads.download({
      url: url,
      filename: message.filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.txt'
    });
  }
  // TODO: Implement server-side scraping so this will actually work with any urls,
  // not just hardcoded test data in rag.py
  if (message.action === 'retrieveContent') {
    const url = 'http://127.0.0.1:8000/add_from_url';
    // send it to our backend server
    fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'url': message.source })
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
  // TESTING CODE FOR SIDEBAR
  if (message.action === 'testSidebarResults') {
    const url = 'http://127.0.0.1:8000/query';
    // send it to our backend server
    fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify({ 'url': message.source })
      // Send test cases to backend server
      body: JSON.stringify( { 
        'tosdr_cases': [
        'This service receives your precise location through GPS coordinates',
        'Deleted content is not really deleted'
        ],
        'service': 'Telegram'
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
        source: message.source
      })
    })
    .catch(error => {
      console.log("Error in fetching: ", error);
    });
  }
});