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
function findLegalLinks() {
    let url = window.location.href;
    const links = Array.from(document.links);
    let name = document.getElementsByTagName('title')[0].innerText;
    let legalLinks = links.filter(link => {
    return /terms|privacy|legal|policy/i.test(link.href);
    });
    let service = rootDomain((new URL(url)).hostname);
    console.log(legalLinks);
    legalLinks = legalLinks.map(link => link.href)
    legalLinks = removeDuplicates(legalLinks)
    console.log(legalLinks);
    browser.runtime.sendMessage({
        action: 'retrieveContent',
        service: service,
        name: name,
        urls: legalLinks
    })
}
    
// Run the function when the content script is loaded
findLegalLinks();