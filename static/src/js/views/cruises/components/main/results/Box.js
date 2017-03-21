// Deps =========================================
import moment from 'moment';

// Internal =====================================
const { Component, PropTypes } = React;

// Quick Quote Component Class ==================
export default class ResultsBox extends Component {

    static propTypes = {
        itinerary: PropTypes.object.isRequired,
        tourLen: PropTypes.number.isRequired,
        doEdit: PropTypes.func.isRequired
    };

    constructor(props) {

        super(props);

        this.state = {};

        this._bind('clickEdit');
    }

    clickEdit() {

        this.props.doEdit();
    }

    render() {

        const { props, clickEdit } = this;
        const { cruiseLine, ship, depart, arrive, date } = props.itinerary;

        console.log(props);

        return (
            <header className="xs-12 crz-itin">
                <div className="row center-xs">
                    <div className="xs-10">
                        { (props.tourLen === 0) ? null :
                            <span>
                                <big>{ props.tourLen } TOURS</big>
                                <p>available at Roatan, Honduras</p>
                            </span>
                        }
                        <p><b>{ cruiseLine } - { ship }</b> { moment(date, 'DD/MM/YYYY').format('DD/MMM/YYYY') }</p>
                        <p>Arrives: { arrive } - Departs: { depart }</p>
                    </div>
                </div>
                <div className="row">
                    <div className="xs-offset-3 xs-6 md-offset-8 md-4 lg-offset-10\ lg-2">
                        <button className="btn-blue btn-block" onClick={ clickEdit }>Edit</button>
                    </div>
                </div>
            </header>
        );
    }
}
