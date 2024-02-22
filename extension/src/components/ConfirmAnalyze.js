const ConfirmAnalyzeModal = (props) => {
    const { service } = props;
    const { queryCategories } = props;
    const { handleConfirm } = props;

    return (
        <dialog id="confirm_analyze_modal" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-xl">
                    Request analysis for {service}?
                </h3>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn">Cancel</button>
                        <button className="btn" onClick={() => handleConfirm(service)}>Confirm </button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default ConfirmAnalyzeModal;