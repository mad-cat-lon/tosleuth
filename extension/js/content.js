function findLegalLinks() {
    const links = Array.from(document.links);
    const legalLinks = links.filter(link => {
      return /terms|privacy|legal|policy/i.test(link.href);
    });
    legalLinks.forEach(link => {
      // Fetch and download the content
      fetch(link.href)
        .then(response => response.text())
        .then(text => {
          // Just send the URL to the backend so we can handle it for now
          browser.runtime.sendMessage({
            action: 'retrieveContent',
            data: text,
            source: link.href
          })
          // Send message to background.js so we download the file 
          // Not downloading from within Firefox rn, let the backend handle it so we can render js
          // browser.runtime.sendMessage({ action: 'download', data: text, filename: link.href });
        })
        .catch(console.error);
        console.log(link.href);
    });
  }
    
// Run the function when the content script is loaded
findLegalLinks();