browser.runtime.onInstalled.addListener(() => {
    console.log("Extension initialized.")
})

// Listen for any tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab's status is 'complete' which means the page and its scripts have loaded
    if (changeInfo.status === 'complete' && tab.active) {
      // Inject the content script into the current page
      browser.tabs.executeScript(tabId, { file: 'extension\\js\\content.js' }).then(
        (message) => {
          console.log("Success: " + message);
        },
        (message) => {
          console.log("Failure: " + message);
        }
      );
    }
});