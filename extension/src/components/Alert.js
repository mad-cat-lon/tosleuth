const Alert = (props) => {
    const { alertMessage } = props;
    const { alertClass } = props;
    const { alertAnimation } = props;
    const { handleOnAnimationEnd } = props;

    return (
        <div
            role="alert"
            className={`alert fixed top-5 ${alertClass} ${alertAnimation} p-2 max-w-lg z-50`}
            onAnimationEnd={() => handleOnAnimationEnd}
        >
            <span className="ml-3">
                {alertMessage}
            </span>
        </div>
    )
}

export default Alert;