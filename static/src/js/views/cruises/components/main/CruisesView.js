// Deps =========================================
import SearchBox from './SearchBox';
import Results from './Results';

// Internal =====================================
const { Component, PropTypes } = React;

// Quick Quote Component Class ==================
export default class CruisesView extends Component {

    static propTypes = {
        cruiseLines: PropTypes.array,
        ports: PropTypes.array
    };

    constructor(props) {

        super(props);

        this.state = {
            sailSched: [],
            itinerary: {},
            showSearch: true
        };

        this.baseState = this.state;

        this._bind('doSearch', 'doEdit', 'toggleSearchBox');
    }

    toggleSearchBox(showSearch = false, completeItinerary) {

        let { itinerary } = this.state;

        if (completeItinerary) {
            itinerary = Object.assign(itinerary, completeItinerary);
        }

        this.setState({ showSearch, itinerary });
    }

    doEdit() {

        this.setState(this.baseState);
    }

    doSearch(sailSched = [], itinerary = {}) {

        this.setState({ sailSched, itinerary });
    }

    render() {

        const { props, state, doSearch, toggleSearchBox, doEdit } = this;
        const { sailSched, itinerary, showSearch } = state;
        const results$ = (!sailSched.length) ? null : (
            <Results
                ports={ props.ports }
                sailSched={ sailSched }
                itinerary={ itinerary }
                showSearch={ showSearch }
                toggleSearchBox={ toggleSearchBox }
                doEdit={ doEdit }
            />
        );

        return (
            <section className="container crz-box">
                { showSearch && <SearchBox className={ sailSched.length ? 'active' : '' } cruiseLines={ props.cruiseLines } doSearch={ doSearch } /> }
                { results$ }
            </section>
        );
    }
}
