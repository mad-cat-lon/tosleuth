import browser from 'webextension-polyfill';
import { useState, useEffect, useCallback } from 'react';

import QueryCategorySelectionModal from './components/QuerySelection';
// import ServiceSelectionDropdown from './components/ServiceSelection';
import ConfirmAnalyzeModal from './components/ConfirmAnalyze';
import Alert from './components/Alert';

function App() {

  const [isLoading, setIsLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState(null);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [services, setServices] = useState({});
  const [currentService, setCurrentService] = useState("");
  const [results, setResults] = useState([]);
  const [theme, setTheme] = useState('light');
  
  const [ratingMap] = useState({
    neutral: '📋',
    warning: '⚠️',
    positive: '✅',
    negative: '❌'
  })
  // Stores tosdr points by category so they can be selected in the menu
  const [queryCategories, setQueryCategories] = useState(
    [
      {
        'name': '📒 Account policies',
        'cases': [
          {
            'text': 'This service can delete your account without prior notice and without a reason',
            'rating': 'neutral'
          },
          {
            'text': 'You must provide your legal name, pseudonyms are not allowed',
            'rating': 'negative'
          },
          {
            'text': 'User accounts can be terminated after having been in breach of the terms of service repeatedly',
            'rating': 'neutral'
          },
          {
            'text': 'This service can be used without providing a user profile',
            'rating': 'positive'
          }
        ],
        'checked': false
      },
      {
        'name': '👁️ Tracking and data collection',
        'cases': [
          {
            'text': 'This service does not track your IP address',
            'rating': 'positive'
          },
          {
            'text': 'This service tracks you on other websites',
            'rating': 'negative'
          },
          {
            'text': 'This service may collect, use, and share location data',
            'rating': 'negative'
          },
          {
            'text': 'Third party cookies are used for advertising',
            'rating': 'warning'
          },
          {
            'text': 'This service tracks you via third-party cookies for other purposes without your consent',
            'rating': 'negative'
          },
          {
            'text': 'The service may use tracking pixels, web beacons, browser fingerprinting, and/or device fingerprinting on users',
            'rating': 'negative'
          },
          {
            'text': 'This service receives your precise location through GPS coordinates',
            'rating': 'negative'
          },
          {
            'text': 'This service collects your biometric data',
            'rating': 'negative'
          },
          {
            'text': 'This service still tracks you even if you opted out from tracking',
            'rating': 'negative'
          },
          {
            'text': 'This service uses cookies that only collect anonymous, aggregated data that cannot be linked to a unique identity.',
            'rating': 'positive'
          }
        ],
        'checked': false
      },
      {
        'name': '📁 Data storage and retention',
        'cases': [
          {
            'text': 'This service stores your data whether you have an account or not',
            'rating': 'negative'
          },
          {
            'text': 'This service stores data on you even if you did not interact with the service',
            'rating': 'negative'
          },
          {
            'text': 'The service can sell or otherwise transfer your personal data as part of a bankruptcy proceeding or other type of financial transaction.',
            'rating': 'negative'
          },
          {
            'text': 'This service may keep personal data after a request for erasure for business interests or legal obligations',
            'rating': 'negative'
          },
          {
            'text': 'The service may keep a secure, anonymized record of your data for analytical purposes even after the data retention period',
            'rating': 'negative'
          }
        ],
        'checked': false
      },
      {
        'name': '⚖️ Legal rights',
        'cases': [
          {
            'text': 'This service may change their terms at any time at their discretion, without notice to you',
            'rating': 'warning'
          },
          {
            'text': 'You waive your moral rights',
            'rating': 'negative'
          },
          {
            'text': 'This service retains rights to your content even after you stop using your account',
            'rating': 'negative'
          },
          {
            'text': 'You waive your right to a class action.',
            'rating': 'negative'
          },
          {
            'text': 'You have the right to leave this service at any time',
            'rating': 'positive'
          },
          {
            'text': 'The service will resist legal requests for your information where reasonably possible',
            'rating': 'positive'
          },
          {
            'text': 'You agree to defend, indemnify, and hold the service harmless in case of a claim related to your use of the service',
            'rating': 'negative'
          },
          {
            'text': 'This service forces users into binding arbitration in the case of disputes',
            'rating': 'negative'
          },
          {
            'text': 'Any liability on behalf of the service is only limited to the fees you paid as a user',
            'rating': 'negative'
          }
        ],
        'checked': false
      }
    ]
  );

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const handleMessage = (msg) => {
    if (msg.action === 'updateResults') {
      setResults(prevResults => [...prevResults, ...msg.data['results']]);
    }
    // success and error handling
    // TODO: this is really hacky
    if (msg.action === 'backendResponse') {
      setIsLoading(false);
      setBackendResponse(msg);
      setShowAlert(true);
      if (msg.error === false && (msg.type === 'upload_content' || msg.type === 'upload_url')) {
        // Handle manual content upload success
        // if we successfully uploaded then add to the list of services and docs 
        setServices(prevServices => {
          // Check if service exists
          if (prevServices.hasOwnProperty(msg.service)) {
            return {
              ...prevServices,
              [msg.service]: [...prevServices[msg.service], msg.url]
            };
          }
          else {
            return {
              ...prevServices,
              [msg.service]: [msg.url]
            };
          }
        });
      }
    }
  };
  

  useEffect(() => {
    browser.runtime.onMessage.addListener(handleMessage);
    // Listen for changes to apply to HTML tag
    document.querySelector('html').setAttribute('data-theme', theme);
    // Cleanup listener when component unmounts
    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, [theme]);
  
  // useEffect hook to automatically hide the toast
  useEffect(() => {
    let timer;
    if (showAlert) {
      timer = setTimeout(() => {
        setShowAlert(false); // Hide the toast after 2 seconds
      }, 3500); 
    }
    return () => clearTimeout(timer); // Cleanup the timer
  }, [showAlert]); // This effect depends on the showAlert state

  async function handleAnalyze() {
    browser.runtime.sendMessage({ action: 'standardAnalyze' });
    setIsLoading(true);
  }

  async function handleAutoAnalyze() {
    browser.runtime.sendMessage({ action: 'autoAnalyze' });
    setIsLoading(true);
  }

  async function handleAddCurrentDoc() {
    browser.runtime.sendMessage({ action: 'addContent' });
    setIsLoading(true);
  }

  async function handleAnalyzeStoredDocs(targetService) {
    // Check for selected query category before analysis
    // If categories are selected, send to background.js to make request to backend
    setIsLoading(true);
    browser.runtime.sendMessage({
      action: 'analyzeStoredContent',
      service: targetService
    })
  }

  const handleChooseQueryCategory = (index) => {
    setQueryCategories(prevQueryCategories => {
      const newQueryCategories = prevQueryCategories.map((category, i) => {
        if (i === index) {
          return { ...category, checked: !category.checked };
        }
        return category;
      });
      return newQueryCategories;
    });
  }

  const handleSubmitQueryCategories = () => {
    browser.runtime.sendMessage({
      action: 'updateQueries',
      data: queryCategories
            .filter(
              query => query.checked === true
            )
            .reduce(
              (array, item) => {
                  return array.concat(item.cases)
              }, []
            )
    });
    return;
  }

  function clearResults() {
    setResults([]);
  }

  return (
    <div className="App">
      <div className="flex items-center min-h-screen justify-top pt-6 flex-col h-screen font-mono text-base-content">
        {/* Simple alert message containing backend success/error */}
        {
        showAlert && backendResponse && 
          (
            <Alert
              alertClass={backendResponse.error ? 'alert-error' : 'alert-success'}
              alertMessage={backendResponse.message}
              alertAnimation='animate-slide-in-down'
              handleOnAnimationEnd={() => setShowAlert(false) && setBackendResponse(null)}
            />
          )
        }
        <div className="flex min-h-[50v] w-2/3 gap-4 flex-col items-center">
          <label className="flex cursor-pointer gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
            <input type="checkbox" class="toggle theme-controller" onClick={toggleTheme}/>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </label>
            {isLoading && <span className="loading loading-bars loading-lg text-success"></span>}
            <button 
              className={`btn btn-lg btn-wide btn-outline w-full ${error ? 'animate-shake' : ''}`}
              onClick={()=>document.getElementById("query_selection_modal").showModal()}
              disabled={(Object.keys(services).length === 0)}
            >
              ✏️ Select analysis categories
            </button>
            <QueryCategorySelectionModal queryCategories={queryCategories} handleCheck={handleChooseQueryCategory} handleSubmit={handleSubmitQueryCategories}/>
            
            <div className="flex flex-row gap-2 items-center w-full">
              <button className="btn btn-lg btn-primary btn-wide btn-active w-1/2" onClick={handleAddCurrentDoc}>Store current document</button>
              <div className="dropdown dropdown-bottom">
                <div tabIndex={0} role="button" className="btn btn-lg btn-primary btn-wide btn-outline w-full">Analyze a service</div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    {
                      Object.keys(services).map((service, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            document.getElementById("confirm_analyze_modal").showModal(); setCurrentService(service)
                            }
                          }
                          className="text-lg hover:bg-primary-content"
                        >
                          <a>{service}</a>
                        </li>
                      ))
                    }
                  </ul>
                </div>
            </div>
            <ConfirmAnalyzeModal service={currentService} queryCategories={queryCategories} handleConfirm={handleAnalyzeStoredDocs}/>
            
            {/* <button className="btn btn-lg btn-secondary btn-wide btn-active w-full" onClick={handleAnalyze}> 👁️ Analyze current page</button> */}
            <button className="btn btn-lg btn-secondary btn-wide btn-active w-full" onClick={handleAutoAnalyze}>🔍 Discover documents</button>
            <button className="btn btn-lg btn-accent btn-wide btn-active w-full" onClick={clearResults}>🗑️ Clear results</button>
        </div>
        {
          results.length > 0 && (
            <div className="divider divider-warning"><span className="text-lg font-bold">Results for {results[0].source_service}</span></div>
          )
        }
        <div className="results-container min-h-[50v] overflow-auto">
          {results.map((item, index) => (
            <>
            {
                <div className="collapse collapse-arrow">
                  <input type="checkbox" />
                  <div className="collapse-title text-xl font-bold">
                    {ratingMap[item.tosdr_case.rating]} {item.tosdr_case.text}
                  </div>
                  <div className="collapse-content"> 
                    <div className="divider divider-error">
                      <p className="text-lg font-bold">Source in text</p>
                    </div>
                    <div class="tooltip tooltip-primary" data-tip="Click to go to source">
                      <p className="text-base"><a href={`${item.source_url}#:~:text=${item.source_text.split(' ').slice(0, 5).join(' ')}`}>"{item.source_text}"</a></p>
                    </div>
                    <div className="divider divider-error">
                      <p className="text-lg font-bold">Generated reasoning</p>
                    </div>
                    <p className="text-base">{item.reason}</p>
                  </div>
                </div>
            }
            </>
          ))}
        </div>
      </div>
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <aside>
          <p>Found a bug? Open a Github issue</p>
        </aside>
      </footer>
    </div>
  );
}

export default App;
