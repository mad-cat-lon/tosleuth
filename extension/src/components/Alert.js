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
        >   <h2 class="font-bold">
                {alertMessage}
            </h2>
        </div>
    )
}

export default Alert;