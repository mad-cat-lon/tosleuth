import browser from 'webextension-polyfill';
import { useState, useEffect } from 'react';

import QueryCategorySelectionModal from './components/QuerySelection';

function App() {

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [theme, setTheme] = useState('light');

  // Stores tosdr points by category so they can be selected in the menu
  const queries = [
    {
      'name': '🍪 Cookie policies',
      'cases': [
        'Third party cookies are used for advertising',
        'Tracking via third-party cookies for other purposes without your consent',
      ]
    },
    {
      'name': '📒 Account policies',
      'cases': [
        'This service can delete your account without prior notice and without a reason'
      ]
    },
    {
      'name': '👁️ Tracking and data collection',
      'cases': [
        'This service tracks you on other websites',
        'This service stores your data whether you have an account or not',
        'This service stores data on you even if you did not interact with the service'
      ]
    },
    {
      'name': '⚖️ Legal rights',
      'cases': [
        'You waive your moral rights',
        'This service retains rights to your content even after you stop using your account',
        'You waive your right to a class action.',
        'You have the right to leave this service at any time'
      ]
    }
  ]

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const handleMessage = (msg) => {
    if (msg.action === 'loadingResults') {
      setIsLoading(true);
    }
    if (msg.action === 'updateResults') {
      setData(msg.data['results']);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    browser.runtime.onMessage.addListener(handleMessage);

    // Listen for changes to apply to HTML tag
    document.querySelector('html').setAttribute('data-theme', theme);

    // Cleanup listener when component unmounts
    return () => browser.runtime.onMessage.removeListener(handleMessage);
  })
  
  async function handleAnalyze() {
    browser.runtime.sendMessage({ action: 'standardAnalyze' });
    setIsLoading(true);
  }

  async function handleAutoAnalyze() {
    browser.runtime.sendMessage({ action: 'autoAnalyze' });
    setIsLoading(true);
  }
  
  function clearData() {
    setData([]);
  }

  return (
    <div className="App">
      <div className="flex items-center min-h-screen justify-top pt-6 flex-col h-screen font-mono text-base-content">
        <div className="flex min-h-[50v] w-2/3 gap-4 flex-col items-center">
          <label className="flex cursor-pointer gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
            <input type="checkbox" class="toggle theme-controller" onClick={toggleTheme}/>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </label>
            {isLoading && <span className="loading loading-bars loading-lg text-success"></span>}
            <button className="btn btn-lg btn-wide btn-outline w-full" onClick={()=>document.getElementById("query_selection_modal").showModal()}>✏️ Select analysis categories</button>
            <QueryCategorySelectionModal queries={queries}/>
            <button className="btn btn-lg btn-primary btn-wide btn-active w-full" onClick={handleAnalyze}> 👁️ Analyze current page</button>
            <button className="btn btn-lg btn-secondary btn-wide btn-active w-full" onClick={handleAutoAnalyze}>🔍 Auto-discover and analyze</button>
            <button className="btn btn-lg btn-accent btn-wide btn-active w-full" onClick={clearData}>🗑️ Clear results</button>
        </div>
        {
          data.length > 0 && (
            <div className="divider divider-warning"><span className="text-lg font-bold">Results for {data[0].source_service}</span></div>
          )
        }
          {data.map((item, index) => (
            <>
            {
              item.answer && (
                <div className="collapse collapse-arrow">
                  <input type="checkbox" />
                  <div className="collapse-title text-xl font-bold">
                    ⚠️ {item.tosdr_case}
                  </div>
                  <div className="collapse-content"> 
                    <div className="divider divider-error">
                      <p className="text-lg font-bold">Source in text</p>
                    </div>
                    <div class="tooltip tooltip-primary" data-tip="Click to open source document">
                      <p className="text-base"><a href={item.source_url}>"{item.source_text}"</a></p>
                    </div>
                    <div className="divider divider-error">
                      <p className="text-lg font-bold">Generated reasoning</p>
                    </div>
                    <p className="text-base">{item.reason}</p>
                  </div>
                </div>
              )
            }
            </>
          ))}
      </div>
    </div>
  );
}

export default App;
