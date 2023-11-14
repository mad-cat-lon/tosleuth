function findLegalLinks() {
  console.log("hi");
    const links = Array.from(document.links);
    const legalLinks = links.filter(link => {
      return /terms|privacy|legal|tos|conditions|policy/i.test(link.href);
    });
    // console.log("hi");
    // legalLinks.forEach(link => {
    //   // Fetch and download the content
    //   fetch(link.href)
    //     .then(response => response.text())
    //     .then(text => {
    //       // Here you would normally save the content, but for demonstration, we'll just log it
    //       console.log(text);
    //       // To download the file, we'll send a message to the background script
    //       // browser.runtime.sendMessage({ action: 'download', data: text, filename: link.innerText });
    //     })
    //     .catch(console.error);
    //     console.log(link.href);
    // });
  }
    
// Run the function when the content script is loaded
findLegalLinks();