// Deps =========================================
import DatePicker from 'react-datepicker';
import moment from 'moment';
// import SweetAlert from 'sweetalert-react';
import _ from 'utils';

// Internal =====================================
const { Component, PropTypes } = React;
const internals = {};

// Create Select JSX ============================
internals.ddl = (mask, val, wrapClass, changeHandler, opts) => {

    const optsJSX = opts.map((element) => (<option key={ `ddl-${_.rand()}` } value={ element.val }>{ element.name }</option>));

    return (
        <div className={ `xs-12 ddl-wrap field-wrap ${wrapClass}` }>
            <div className="ddl-text">{ mask }</div>
            <select
                onChange={ changeHandler }
                onFocus={ e => e.preventDefault() }
                onBlur={ e => e.preventDefault() }
                value={ val } >
                { optsJSX }
            </select>
        </div>
    );
};

// Quick Quote Component Class ==================
export default class SearchBox extends Component {

    static propTypes = {
        doSearch: PropTypes.func
    };

    static defaultProps = {
        doSearch: () => { }
    };

    constructor(props) {

        super(props);
        let sailLine;
        const schedMap = (sched) => {

            const format = 'YYYY-MM-DD HH:mm:ss:SSS';

            sched.date = moment(sched.date, format);
            sched.portDate = moment(sched.portDate, format);

            return sched;
        };

        //== Init cruiseLines
        this.sailLines = [];
        this.cruiseLines = {};
        this.ships = {};
        this.availableDates = [];
        for (let i = 0, len = props.cruiseLines.length; i < len; ++i) {
            sailLine = props.cruiseLines[i];
            this.cruiseLines[sailLine.id] = sailLine;
            this.sailLines.push({ name: sailLine.name, val: sailLine.id });

            for (let j = 0, shipLen = sailLine.ships.length; j < shipLen; ++j) {
                sailLine.ships[j].schedules.map(schedMap);
                this.ships[sailLine.ships[j].id] = sailLine.ships[j];
            }
        }

        //== Init state
        this.state = {
            sailLine: this.sailLines[0].val,
            sailShip: null,
            sailDate: null,
            withResults: false
        };

        //== adding multiple listeners
        this._bind('changeSailLine', 'changeSailShip', 'changeDate');

        //== Datepicker Locale
        moment.updateLocale('en', {
            months: [
                'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
            ],
            weekdaysMin: [
                'S', 'M', 'T', 'W', 'T', 'F', 'S'
            ]
        });
    }

    changeSailLine(e) {

        const sailLine = e.target.value;

        this.props.doSearch();
        this.setState({ sailLine, sailShip: null, sailDate: null, withResults: false });
    }

    changeSailShip(e) {

        const sailShip = e.target.value;
        const scheds = this.ships[sailShip].schedules;
        let sched;

        this.availableDates = [];
        for (let i = 0, len = scheds.length; i < len; ++i) {
            sched = scheds[i];
            this.availableDates.push(sched.date);
        }

        this.setState({ sailShip: e.target.value, sailDate: null });
    }

    changeDate(sailDate) {

        const { sailLine, sailShip } = this.state;
        const ship = this.ships[sailShip];
        const selectedSched = ship.schedules.filter(sched => sched.date.isSame(sailDate));
        const itinerary = {
            date: sailDate,
            cruiseLine: this.cruiseLines[sailLine].name,
            ship: ship.name
        };

        this.props.doSearch(selectedSched, itinerary);
        this.setState({ sailDate, withResults: true });

        return false;
    }

    render() {

        const { state, sailLines, cruiseLines, ships, availableDates, changeSailLine, changeSailShip, changeDate } = this;
        const { sailLine, sailShip, sailDate, withResults } = state;
        const shipsOpts = [{ name: 'Ship Name', val: '' }];
        const cruiseLine = cruiseLines[sailLine];
        const ship = ships[sailShip];
        let sailLineDDL = null;
        let sailShipsDDL = null;
        const shipName = (ship) ? ship.name : shipsOpts[0].name;
        const shipVal = (ship) ? ship.id : shipsOpts[0].id;

        //== Cruise Lines Drop Down
        sailLineDDL = internals.ddl(cruiseLine.name, sailLine, 'generic-ddl', changeSailLine, sailLines);

        //== Ships Drop Down
        for (let i = 0, len = cruiseLine.ships.length; i < len; ++i) {
            shipsOpts.push({ name: cruiseLine.ships[i].name, val: cruiseLine.ships[i].id });
        }
        sailShipsDDL = internals.ddl(shipName, shipVal, 'generic-ddl', changeSailShip, shipsOpts);

        return (
            <header className={ `crz-search row ${ withResults ? 'active' : '' }` }>
                <div className="xs-12">
                    <div className="top center-xs row">
                        <h4 className="xs-12">START HERE</h4>
                        <p className="xs-12 lg-6">Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.</p>
                    </div>
                    <div className="bottom row">
                        <div className="xs-12 lg-4">
                            <div className="row middle-xs">
                                <div className="xs-3 lg-12">
                                    <b>1</b>
                                </div>
                                <div className="xs-9 lg-12">
                                    <span>SELECT CRUISE LINE</span>
                                    { sailLineDDL }
                                </div>
                            </div>
                        </div>
                        <div className="xs-12 lg-4">
                            <div className="row middle-xs">
                                <div className="xs-3 lg-12">
                                    <b>2</b>
                                </div>
                                <div className="xs-9 lg-12">
                                    <span>SELECT SHIP</span>
                                    { sailShipsDDL }
                                </div>
                            </div>
                        </div>
                        <div className={ `xs-12 lg-4 ${ !sailShip ? 'inactive' : '' }` }>
                            <div className="row middle-xs">
                                <div className="xs-3 lg-12">
                                    <b>3</b>
                                </div>
                                <div className="xs-9 lg-12">
                                    <span>YOUR SAIL DATE</span>
                                    <div className="xs-12">
                                        <DatePicker
                                            readOnly
                                            disabled={ !(sailLine && sailShip) }
                                            className="qq-input"
                                            dateFormat="DD/MMM/YYYY"
                                            placeholderText="DD/MMM/YYYY"
                                            onChange={ changeDate }
                                            selected={ sailDate }
                                            includeDates={ availableDates }
                                            minDate={ availableDates[0] || moment().add(1, 'day') }
                                            maxDate={ moment().add(1, 'year') } />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}
