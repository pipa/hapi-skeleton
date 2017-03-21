import TourItem from './Item';

// Internal =================================
const { Component } = React;

const getRecommendedTours = () => {
    let tours = [];

    try {
        const unfilteredTours = JSON.parse(localStorage.recommended);
        // filter the current tour out if present
        tours = unfilteredTours.filter(t => t._id !== _app.page.tour._id );
    } catch(e) {
        tours = [];
    }

    return tours;
}

// Tour Item Component Class ================
export default class RecommendedTours extends Component {
    constructor() {
        super();
        
        this.state = {
            tours: getRecommendedTours()
        }
        this._bind('receiveRecommendations');
    }
    componentDidMount() {
        $.subscribe('recommendations.show', this.receiveRecommendations);
    }
    receiveRecommendations(e, recs) {
        this.setState({tours: recs});
    }
    render() {
        const { tours } = this.state
        const jsx =
            (<div className="related-tours under-water">
                <div className="container">
                    <div className="row">
                        <h3 className="xs-12">You may also like these adventures:</h3>
                        <div className="tours row" style={{textAlign: 'center'}}>
                            { tours.map(t => <TourItem viewmode="grid" tour={t} key={t.tour_id} />) }
                        </div>
                    </div>
                </div>
            </div>);

        return (
            <div>
                {(this.state.tours.length) ? jsx : null}
            </div>
        );
    }
}
