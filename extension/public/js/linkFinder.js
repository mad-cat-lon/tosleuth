function removeDuplicates(array) {
  return array.filter((item,
    index) => array.indexOf(item) === index);
}

function rootDomain(hostname) {
  let parts = hostname.split(".");
  if (parts.length <= 2)
    return hostname;
  
  parts = parts.slice(-3);
  if (['co','com'].indexOf(parts[1]) > -1)
    return parts.join('.');
  
  return parts.slice(-2).join('.');
}

function removeQueryAndHash(url) {
  let urlObj = new URL(url);
  return urlObj.origin + urlObj.pathname;
}

function findLegalLinks() {
  let url = window.location.href;
  let name = document.getElementsByTagName('title')[0].innerText;
  let service = rootDomain((new URL(url)).hostname);
  console.log(service)
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
    service: service,
    name: name,
    urls: legalLinks
  })
}
    
// Run the function when the content script is loaded
findLegalLinks();