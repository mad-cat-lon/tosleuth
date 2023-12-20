
function getCurrentTabId() {
    browser.tabs.query({ active: true, currentWindow: true })
      .then((tabs) => {
        let currentTabId = tabs[0].id;
        console.log("Current Tab ID: ", currentTabId);
        browser.tabs.executeScript(currentTabId, { file: '../js/content.js' });        
        // You can use currentTabId here for your purposes
      })
      .catch((error) => {
        console.error("Error getting the current tab ID: ", error);
      });
  }
document.getElementById('analyze-btn').addEventListener('click', function() {
    document.getElementById('result-log').innerText = 'Analyzing...';
    const tabId = getCurrentTabId();
});