function removeDuplicates(array) {
    return array.filter((item,
        index) => array.indexOf(item) === index);
}
function findLegalLinks() {
    const links = Array.from(document.links);
    let legalLinks = links.filter(link => {
    return /terms|privacy|legal|policy/i.test(link.href);
    });
    console.log(legalLinks);
    legalLinks = legalLinks.map(link => link.href)
    legalLinks = removeDuplicates(legalLinks)
    console.log(legalLinks);
    legalLinks.forEach(link => {
    // Fetch and download the content
    fetch(link)
        .then(response => response.text())
        .then(text => {
        // Just send the URL to the backend so we can handle it for now
        browser.runtime.sendMessage({
            action: 'retrieveContent',
            data: text,
            source: link
        })
        // Send message to background.js so we download the file 
        // Not downloading from within Firefox rn, let the backend handle it so we can render js
        // browser.runtime.sendMessage({ action: 'download', data: text, filename: link.href });
        })
        .catch(console.error);
        console.log(link);
    });
}
    
// Run the function when the content script is loaded
findLegalLinks();