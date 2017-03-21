// Load Modules =================================

//  ==============================-
const Loader = (props) => {

    return (
        <div className={ `curtain white ${props.show ? 'active' : ''}` }>
            <div className="loader">
                <b />
                <b />
                <b />
                <b />
            </div>
        </div>
    );
};

// Exposing =====================================
export default Loader;
