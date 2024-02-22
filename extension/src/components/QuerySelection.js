const QueryCategorySelectionModal = ({queryCategories, handleCheck, handleSubmit}) => {
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
                        <button className="btn" onClick={() => handleSubmit()}>Confirm selection</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default QueryCategorySelectionModal;