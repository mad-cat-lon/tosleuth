function removeDuplicates(array) {
  return array.filter((item,
    index) => array.indexOf(item) === index);
}

function removeQueryAndHash(url) {
  let urlObj = new URL(url);
  return urlObj.origin + urlObj.pathname;
}

function findLegalLinks() {
  const links = Array.from(document.links);
  console.log(links)
  let legalLinks = links.filter(link => {
    return /terms|privacy|legal|policy/i.test(link.href);
  });
  legalLinks = legalLinks.map(link => removeQueryAndHash(link.href))
  legalLinks = removeDuplicates(legalLinks)
  console.log(legalLinks);
  chrome.runtime.sendMessage({
    action: 'retrieveContent',
    urls: legalLinks
  })
}
    
// Run the function when the content script is loaded
findLegalLinks();