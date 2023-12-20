document.addEventListener('DOMContentLoaded', function() {
    const init = document.createElement('p');
    init.textContent = 'Click "Analyze" in the toolbar to analyze the current website\'s privacy agreements';
})

function addResults(results) {
    const accordion = document.getElementById('accordion');
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'accordion-item';

        // Add point title
        item.textContent = result.tosdr_point;

        // Add icon
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = '🔒';
        item.insertBefore(icon, item.firstChild);

        // Add reasoning
        const reason = document.createElement('div');
        reason.className = 'item-content';
        reason.textContent = `${result.reason}`;
        item.appendChild(reason);
        
        // Add point citation
        const citation = document.createElement('div');
        citation.className = 'item-content';
        citation.textContent = `${result.source_text}`;
        item.appendChild(citation);

        // Add event listener
        item.addEventListener('click', function() {
            this.classList.toggle('active');
        });
        
        // Add result box to list
        accordion.appendChild(item);        
    });
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateResults') {
        addResults(message.data['results']);
    }
});

// document.addEventListener('DOMContentLoaded', function() {
//     // Example data
//     const accordion = document.getElementById('accordion');
//     policyPoints.forEach(point => {
//         // Create accordion item
//         const item = document.createElement('div');
//         item.className = 'accordion-item';
//         item.textContent = point.title;

//         // Add icon
//         const icon = document.createElement('span');
//         icon.className = 'icon';
//         icon.textContent = '🔒';
//         item.insertBefore(icon, item.firstChild);

//         // Add content
//         const content = document.createElement('div');
//         content.className = 'item-content';
//         content.textContent = `${point.content} - Source: ${point.citation}`;
//         item.appendChild(content);

//         // Add event listener
//         item.addEventListener('click', function() {
//             this.classList.toggle('active');
//         });

//         accordion.appendChild(item);
//     });
// });