
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

// TODO: Make this inject a script that does this 
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

document.getElementById('auto-analyze-btn').addEventListener('click', function() {
  document.getElementById('result-log').innerText = 'Discovering links...';
  injectCurrentTab();
});

document.getElementById('analyze-btn').addEventListener('click', function() {
  document.getElementById('result-log').innerText = 'Analyzing current page...'
  injectGetContent();
});

// TESTING CODE
document.getElementById('sidebar-test-btn').addEventListener('click', function() {
  document.getElementById('result-log').innerText = 'Open sidebar to view results';
  browser.runtime.sendMessage({
      action: 'testSidebarResults'
  })
});