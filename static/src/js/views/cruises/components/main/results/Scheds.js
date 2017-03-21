// Deps =========================================
import moment from 'moment';

// Internal =====================================
const { Component, PropTypes } = React;

// Quick Quote Component Class ==================
export default class SchedsResults extends Component {

    static propTypes = {
        schedule: PropTypes.array.isRequired,
        ports: PropTypes.object.isRequired,
        fetchTours: PropTypes.func.isRequired
    };

    constructor(props) {

        super(props);
        this._bind('clickDate');
    }

    clickDate(e) {

        const { date, depart, arrive } = e.currentTarget.dataset;

        this.props.fetchTours(date, depart, arrive);
    }

    render() {

        const { clickDate } = this;
        const { schedule, ports } = this.props;
        const sortedSched = schedule.sort((a, b) => a.portDate.diff(b.portDate));
        const schedJSX = [];
        let sched;
        let actionJSX;
        let arrive;
        let depart;

        for (let i = 0, len = sortedSched.length; i < len; ++i) {
            sched = sortedSched[i];
            arrive = (sched.arrival && sched.arrival !== '') ? moment(sched.arrival, 'h:mm:ss A').format('h:mm A') : 'N/A';
            depart = (sched.departure && sched.departure !== '') ? moment(sched.departure, 'h:mm:ss A').format('h:mm A') : 'N/A';
            actionJSX = (sched.port_id !== '242') ? <div className="white" /> : (
                <button
                    type="button"
                    className="btn-orange btn-block row middle-xs"
                    onClick={ clickDate }
                    data-date={ sched.portDate.format('DD/MM/YYYY') }
                    data-arrive={ arrive }
                    data-depart={ depart }>
                    <span>VIEW TOURS</span>
                </button>
            );

            schedJSX.push(
                <div key={ `port-${sched.port_id}-${i}` } className={ `row crz-row ${ sched.port_id === '242' ? 'active' : null }` }>
                    <div className="xs-2">
                        <div className="date row middle-xs">
                            <div className="xs-12">{ sched.portDate.format('MMM D YYYY') }</div>
                        </div>
                    </div>
                    <div className="lg-4 hidden-large-down">
                        <div className="white desc">
                            { ports[sched.port_id].name }
                        </div>
                    </div>
                    <ul className="xs-7 desc white row middle-xs hidden-large-up">
                        <li className="xs-12">PORT: <strong>{ ports[sched.port_id].name }</strong></li>
                        <li className="xs-12">ARRIVE: <strong>{ arrive }</strong></li>
                        <li className="xs-12">DEPART: <strong>{ depart }</strong></li>
                    </ul>
                    <div className="lg-2 txt-center hidden-large-down">
                        <div className="white">{ arrive }</div>
                    </div>
                    <div className="lg-2 txt-center hidden-large-down">
                        <div className="white">{ depart }</div>
                    </div>
                    <div className="xs-3 lg-2 action">
                        { actionJSX }
                    </div>
                </div>
            );
        }

        return (
            <div className="xs-12">
                <div className="results">
                    <div className="row table-hdr txt-center hidden-large-down">
                        <div className="xs-2">ITINERARY</div>
                        <div className="xs-4">PORT</div>
                        <div className="xs-2">ARRIVE</div>
                        <div className="xs-2">DEPART</div>
                    </div>

                    <div className="sched-box">
                        { schedJSX }
                    </div>
                </div>
                <small>Only Ports with tours available will be highlighted.</small>
            </div>
        );
    }
}
