function sendHTML(query_after) {
    let html = document.documentElement.innerHTML;
    let url = window.location.href;
    let name = document.getElementsByTagName('title')[0].innerText;
    let service = (new URL(url)).hostname.replace('www.', '');
    browser.runtime.sendMessage({
        action: 'sendContent',
        service: service,
        url: url,
        name: name,
        text: html,
        query_after: query_after
    })
}
sendHTML();