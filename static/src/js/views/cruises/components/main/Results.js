// Deps =========================================
import SchedsResults from './results/Scheds';
import ToursResults from './results/Tours';
import ResultsBox from './results/Box';
import Loader from 'loader';
import GoFetch from 'fetch-wrapper';

// Internal =====================================
const { Component, PropTypes } = React;
const _fetch = new GoFetch();

// Quick Quote Component Class ==================
export default class Results extends Component {

    static propTypes = {
        sailSched: PropTypes.array.isRequired,
        ports: PropTypes.array.isRequired,
        itinerary: PropTypes.object.isRequired,
        showSearch: PropTypes.bool.isRequired,
        toggleSearchBox: PropTypes.func.isRequired,
        doEdit: PropTypes.func.isRequired
    };

    constructor(props) {

        super(props);
        let port;

        //== Init state
        this.state = {
            loading: false,
            tours: [],
            dateSelected: null
        };

        // Creating object for ports array (faster search)
        this.ports = {};
        for (let i = 0, len = props.ports.length; i < len; ++i) {
            port = props.ports[i];
            this.ports[port.port_id] = port;
        }

        this._bind('toggleLoader', 'fetchTours');
    }

    fetchTours(date, depart, arrive) {

        const { toggleLoader, props } = this;

        toggleLoader(true);
        _fetch
            .post('/tours/for-cruises', null, { date, depart, arrive })
            .then((json) => {

                props.toggleSearchBox(false, { date, depart, arrive });
                this.setState({ tours: json.data });
            })
            .catch((error) => {

                console.log(1);
                console.log(error);
            })
            .then(() => {
                // Always run this
                toggleLoader(false);
            });
    }

    toggleLoader(bool = false) {

        this.setState({ loading: bool });
    }

    render() {

        const { props, state, ports, fetchTours } = this;
        const { loading, tours } = state;
        const { sailSched, itinerary, showSearch, doEdit } = props;

        let resultJSX = <SchedsResults schedule={ sailSched } ports={ ports } fetchTours={ fetchTours } />;

        if (tours.length) {
            resultJSX = <ToursResults tours={ tours } itinerary={ itinerary } />;
        }

        return (
            <div className="crz-results row">

                { !showSearch && <ResultsBox itinerary={ itinerary } tourLen={ tours.length } doEdit={ doEdit } /> }
                { resultJSX }
                <Loader show={ loading } />
            </div>
        );
    }
}
