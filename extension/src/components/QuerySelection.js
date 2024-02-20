import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

const QueryCategorySelectionModal = (props) => {
    
    const { queries } = props;
    // const [selected, select] = useState([]);
    const [queryCategories, selectQueryCategory] = useState(queries);
    
    const handleCheck = index => {
        selectQueryCategory(
            queryCategories.map((query, currentIndex) => 
                currentIndex === index ? { ...query, checked: !query.checked } : query
            )
        )
    }

    const handleSelection = () => {
        browser.runtime.sendMessage({
            action: 'addQueries',
            data: queryCategories
                .filter(
                    query => query.checked === true
                )
                .reduce(
                    (array, item) => {
                        return array.concat(item.cases)
                    }, []
                )
        })
    }

    return (
        <dialog id="query_selection_modal" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-xl">What would you like to know more about?</h3>
                <div className="flex-col space-y-1 py-4">
                    {
                        queryCategories.map((query, index) => (
                        <div className="form-control">
                            <label className="label cursor-pointer justify-start">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-accent mr-2"
                                    checked={query.checked}
                                    onChange={() => handleCheck(index)}
                                />
                                <span className="label-text text-lg">{query.name}</span> 
                            </label>
                        </div>
                        ))
                    }
                </div>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn" onClick={handleSelection}>Confirm selection</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default QueryCategorySelectionModal;