// Deps =========================================
import DatePicker from 'react-datepicker';
import moment from 'moment';
import SweetAlert from 'sweetalert-react';
import _ from 'utils';
import showRecommendedTours from '../../modules/recommendedTours';

// Internal =====================================
const { Component, PropTypes } = React;
const internals = {
    swal: {
        show: false,
        type: 'error',
        title: '😳 Oops!',
        text: 'You forgot to add participants!',
        confirmButtonColor: '#00a5e7'
    }
};

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
export default class QuickQuote extends Component {
    static propTypes = {
        itemId: PropTypes.string,
        tour: PropTypes.object,
        selection: PropTypes.object,
        onUpdate: PropTypes.func,
        cruise: PropTypes.object
    };

    static defaultProps = {
        onUpdate: () => { }
    };

    constructor(props) {

        super(props);
        let location;
        const rates = {};
        const swal = Object.assign({}, internals.swal);
        let time;
        let added;
        let date;

        //== Initializing data
        this.locations = [];
        this.timeOpts = { };
        this.isCruise = false;

        //== Creating locations options and initial rates object
        for (let n = 0, locationsLen = props.tour.locations.length; n < locationsLen; ++n) {
            location = props.tour.locations[n];
            this.locations.push({ name: location.location.name, val: location._id });

            // State rates object
            for (let l = 0, ratesLen = location.rates.length; l < ratesLen; ++l) {
                rates[location._id] = Object.assign({}, rates[location._id], {
                    [location.rates[l]._id]: {
                        val: 0,
                        price: location.rates[l].price
                    }
                });
            }

            // Create time options
            for (let m = 0, timesLen = location.event_time.length; m < timesLen; ++m) {
                time = moment(location.event_time[m], 'h:mm A');
                this.timeOpts[location._id] = this.timeOpts[location._id] || [];
                this.timeOpts[location._id].push({ name: time.format('h:mm A'), val: time.format('h:mm A') });
            }
        }

        //== Default values
        time = this.timeOpts[props.tour.locations[0]._id][0].val;
        location = props.tour.locations[0];
        added = false;
        date = moment().add(1, 'day');

        //== If we receive a previous selected tour
        if ('selection' in props) {
            added = true;
            time = props.selection.time;
            location = props.selection.location;
            date = moment(props.selection.date);

            for (const key in rates) {
                if ({}.hasOwnProperty.call(rates, key)) {
                    if (key in props.selection.rates) {
                        rates[key] = props.selection.rates[key];
                    }
                }
            }
        }

        if ('cruise' in props) {
            date = moment(props.cruise.date, 'DD/MM/YYYY');
            this.isCruise = true;
        }

        //== Init state
        this.state = {
            swal,
            added,
            date,
            location,
            time,
            rates
        };

        //== preserve initial state
        this.baseState = this.state;

        //== adding multiple listeners
        this._bind('toggleAlert', 'handleUpdate', 'handleDPChange', 'handlePaxChange', 'handleTimeChange', 'handleAdd', 'handleLocationChange');

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

    handleDPChange(date) {

        this.setState({ date });
    }

    handlePaxChange(e) {

        const { refs, state } = this;
        const { dataset } = refs[e.target.id];
        const { rates } = state;

        rates[dataset.location][dataset.rate].val =  Number(e.target.value);

        this.setState({ rates });
    }

    handleTimeChange(e) {

        this.setState({ time: e.target.value });
    }

    handleLocationChange(e) {

        const location = this.props.tour.locations.find((loc) => (loc._id === e.target.value));
        const time = location.event_time[0];

        this.setState({ location, time });
    }

    handleUpdate() {

        const { props, state } = this;
        const { itemId } = props;
        const { date, location, time, rates } = state;
        const opts = {
            show: true,
            text: 'There seems to be a problem updating your tour. We have alredy notified our staff about this problem.'
        };
        const items = _.getLocalStorageCart();
        let item;
        let showSwal = true;

        for (let i = 0, len = items.length; i < len; ++i) {
            item = items[i];

            if (item.id === itemId) {
                item.selection = { date, location, time, rates };
                showSwal = false;
            }
        }

        if (showSwal) {
            this.toggleAlert(Object.assign({}, internals.swal, opts));

            return false;
        }

        // Setting updates to localStorage
        localStorage.cart = JSON.stringify({ items });
        props.onUpdate(itemId);

        return true;
    }

    handleAdd(redirect = false) {

        const { props, state, toggleAlert, isCruise } = this;
        const { tour } = props;
        const { date, location, time, rates } = state;
        const { tour_id, name, short_description, locations, thumbnail_image } = tour;
        let items = _.getLocalStorageCart();
        let item = {};
        let valid = false;

        for (const key in rates[location._id]) {
            if ({}.hasOwnProperty.call(rates[location._id], key)) {
                if (rates[location._id][key].val > 0 ) {
                    valid = true;
                    break;
                }
            }
        }

        if (!valid) {
            toggleAlert({ show: true });

            return false;
        }

        item = {
            id: _.rand(),
            isNew: (redirect === true) ? true : false,
            isCruise,
            tour: { tour_id, name, short_description, locations, thumbnail_image },
            selection: { date, location, time, rates }
        };

        // Adding item to the items array
        items = [item, ...items];

        // Adding items to localStorage
        localStorage.cart = JSON.stringify({ items });

        showRecommendedTours();

        if (redirect === true) {
            window.location = '/cart/';

            return true;
        }

        return $.publish('cart.show', [items]);
    }

    reset() {

        this.setState(this.baseState);
    }

    toggleAlert(opts) {

        const swal = Object.assign({}, internals.swal, opts);

        this.setState({ swal });
    }

    render() {
        const { locations, timeOpts, toggleAlert, state, handleAdd, handleUpdate, handleDPChange, handlePaxChange, handleTimeChange, handleLocationChange, props } = this;
        const { swal, date, location, rates, time } = state;
        const rateSelectionJSX = [];
        let total = 0;
        let rate;
        let inputId;
        let locationDDL = null;
        let timeDDL = null;
        let locationJSX = null;
        let datepickerJSX = (
            <div className="row">
                <label htmlFor="" className="xs-12">Pick your date:</label>
                <div className="xs-12">
                    <DatePicker
                        readOnly
                        className="qq-input"
                        dateFormat="DD/MMM/YYYY"
                        onChange={ handleDPChange }
                        selected={ date }
                        minDate={ moment().add(1, 'day') }
                        maxDate={ moment().add(90, 'days') } />
                </div>
            </div>
        );
        let footerJSX = null;

        //== Creating rates jsx
        for (let i = 0, locationLen = location.rates.length; i < locationLen; ++i) {
            rate = location.rates[i];
            inputId = `rate-input-${i}`;
            rateSelectionJSX.push(
                <div key={ `rate-${location._id}-${i}` } className="row">
                    <label htmlFor={ inputId } className="xs-5">{ _.capPhrase(rate.name) }</label>
                    <div className="xs-3">
                        <input type="number" min="0" ref={ inputId } data-rate={ rate._id } data-location={ location._id } id={ inputId } defaultValue={ rates[location._id][rate._id].val } />
                    </div>
                    <label htmlFor={ inputId } className="xs-1 x">X</label>
                    <label htmlFor={ inputId } className="xs-3 rate">${ rate.price }</label>
                </div>
            );
        }

        //== Getting total price with selected rates
        for (const _rate in rates[location._id]) {
            if ({}.hasOwnProperty.call(rates[location._id], _rate)) {
                total += (rates[location._id][_rate].val * rates[location._id][_rate].price);
            }
        }

        footerJSX = (
            <footer>
                <div className="row price-box">
                    <div className="xs-8">Total Price:</div>
                    <div className="xs-4 txt-right price">${ total }</div>
                </div>
                <div className="row">
                    <div className="xs">
                        <button className="btn-orange btn-block" onClick={ () => { handleAdd(true); } }>ADD TO CART</button>
                    </div>
                </div>
                <div className="row">
                    <div className="xs">
                        <button className="btn-blue btn-sm btn-block add-continue-btn" onClick={ handleAdd }>ADD TO CART &amp; CONTINUE SHOPPING</button>
                    </div>
                </div>
            </footer>
        );

        //== Location Drop Down
        locationDDL = internals.ddl(location.location.name, location._id, 'location-ddl', handleLocationChange, locations);
        locationJSX = (
            <div className="row">
                <label htmlFor="" className="xs-12">Location:</label>
                { locationDDL }
            </div>
        );

        //== Times Drop Down
        timeDDL = internals.ddl(time, time, 'time-ddl', handleTimeChange, timeOpts[location._id]);

        //== Footer
        if ('selection' in props) {
            footerJSX = (
                <footer>
                    <div className="row price-box">
                        <div className="xs-8">Tour Total:</div>
                        <div className="xs-4 txt-right price">${ total }</div>
                    </div>
                    <div className="row">
                        <div className="xs">
                            <button className="btn-blue btn-sm btn-block" onClick={ handleUpdate }>SAVE CHANGES</button>
                        </div>
                    </div>
                </footer>
            );
        }

        if ('cruise' in props) {
            datepickerJSX = null;
            locationJSX = null;
            footerJSX = (
                <footer>
                    <div className="row price-box">
                        <div className="xs-8">Total Price:</div>
                        <div className="xs-4 txt-right price">${ total }</div>
                    </div>
                    <div className="row">
                        <div className="xs">
                            <button className="btn-orange btn-sm btn-block" onClick={ handleAdd }>ADD TO CART</button>
                        </div>
                    </div>
                </footer>
            );
        }

        return (
            <aside className="qq-wrap">
                <div className="qq-main">
                    { datepickerJSX }
                    { locationJSX }
                    <div className="row pax" onChange={ handlePaxChange }>
                        <label>Participants:</label>
                        <div className="xs-12 box">
                            { rateSelectionJSX }
                        </div>
                    </div>
                    <div className="row">
                        <label htmlFor="" className="xs-12">Select time:</label>
                        { timeDDL }
                    </div>
                    { footerJSX }
                </div>
                <SweetAlert
                    { ...swal }
                    onConfirm={ () => toggleAlert({ show: false }) }
                    onEscapeKey={ () => toggleAlert({ show: false }) }
                    onOutsideClick={ () => toggleAlert({ show: false }) }
                />
            </aside>
        );
    }
}
