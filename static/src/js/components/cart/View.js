// Deps =========================================
import _ from 'utils';
import moment from 'moment';
import QQ from '../global/QQ.js';
import SweetAlert from 'sweetalert-react';

// Internal =====================================
const { Component } = React;
const internals = {
    swal: {
        show: false,
        title: 'Are you sure?',
        text: 'Please confirm that you want to delete this tour.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel plx!'
    }
};

// Quick Quote Component Class ==================
export default class CartView extends Component {

    constructor(props) {

        super(props);

        //== Init state
        this.state = {
            items: [],
            editMode: [],
            swal: Object.assign({}, internals.swal)
        };

        //== Check if we have items
        if ('cart' in localStorage) {
            this.state = Object.assign(this.state, JSON.parse(localStorage.cart));
        }

        this._bind('handleRemoveConfirm', 'handleRemove', 'handleEdit', 'handleUpdate', 'toggleAlert');
    }

    handleRemoveConfirm(e) {

        const { handleRemove, toggleAlert } = this;
        const item = JSON.parse(e.target.dataset.item);
        const opts = Object.assign({}, internals.swal, {
            show: true,
            text: `Please confirm that you want to remove '${ item.tour.name }' tour.`,
            onConfirm: () => {

                handleRemove(item.id);
            },
            onCancel: toggleAlert,
            onEscapeKey: toggleAlert,
            onOutsideClick: toggleAlert
        });

        toggleAlert(opts);
    }

    handleRemove(itemId) {

        let { items } = this.state;
        const index = items.findIndex((item) => item.id === itemId);
        const swal = Object.assign({}, internals.swal);

        items = [
            ...items.slice(0, index),
            ...items.slice(index + 1)
        ]; // Removing the element selected

        localStorage.cart = JSON.stringify({ items });
        this.setState({ items, swal });
    }

    handleEdit(e) {

        const tourId = e.target.dataset.id;
        let { editMode } = this.state;

        if (!editMode.includes(tourId)) {
            editMode = [...editMode, tourId];
            this.setState({ editMode });
        }
    }

    handleUpdate(itemId) {

        let { editMode } = this.state;

        editMode = editMode.filter(el => ![itemId].some(exclude => el === exclude));

        this.setState({ editMode });
    }

    toggleAlert(opts = {}) {

        const swal = Object.assign({}, internals.swal, opts);

        this.setState({ swal });
    }

    render() {

        const { state, handleRemoveConfirm, handleEdit, handleUpdate } = this;
        const { items, editMode, swal } = state;
        const count = items.length;
        const itemsJSX = [];
        let item;
        let style;
        let link;
        let participants;
        let selection;
        let itemId;
        let subtotal;
        let total = 0;
        let rates;
        let show;

        if (count === 0) {
            return (
                <div className="container">
                    <h4>No items</h4>
                </div>
            );
        }

        for (let step = 0; step < count; ++step) {
            item = items[step];
            itemId = item.id;
            show = false;
            style = {
                'backgroundImage': `url("${ item.tour.thumbnail_image }")`
            };
            link = `/tour/${ item.tour.tour_id }/${ _.urlName(item.tour) }/`;
            participants = 0;
            subtotal = 0;
            rates = item.selection.rates[item.selection.location._id];

            // Get participants
            for (const key in rates) {
                if ({}.hasOwnProperty.call(rates, key)) {
                    participants += rates[key].val;
                    subtotal += (rates[key].price * rates[key].val);
                }
            }

            total += subtotal;

            if (editMode.includes(itemId)) {
                selection = (
                    <div className="card-white no-rotate">
                        <QQ itemId={ item.id } tour={ item.tour } selection={ item.selection } onUpdate={ handleUpdate } />
                    </div>
                );
            } else {
                selection = (
                    <div className="card-white no-rotate">
                        <p><b>Date:</b> { moment(item.selection.date).format('DD/MMM/YYYY') }</p>
                        <p><b>Participants:</b> { participants }</p>
                        <strong>Subtotal: ${ subtotal }</strong>
                        <div className="row action-btns">
                            <div className="xs-6">
                                <button className="btn-blue btn-block btn-sm" data-id={ itemId } onClick={ handleEdit }>EDIT</button>
                            </div>
                            <div className="xs-6">
                                <button className="btn-red btn-block btn-sm" data-item={ JSON.stringify(item) } onClick={ handleRemoveConfirm }>REMOVE</button>
                            </div>
                        </div>
                    </div>
                );
            }

            if (item.isNew) {
                show = true;
                item.isNew = false;
                _.setLocalStorageCart(items);
            }

            itemsJSX.push(
                <div key={ `cart-item-${ step }` }>
                    <div className={ `row tour-item ${ show ? 'new-tour' : null }` }>
                        { show && <h5 className="xs-12">Added to cart:</h5> }
                        <div className="xs-12 lg-3">
                            <a href={ link } className="tour-img" style={ style }>
                                <div className="tour-ribbon">
                                    <div className="tour-price txt-center"><span>Starts From:</span><small>$</small>{ _.getLowestRate(item.tour) }</div>
                                </div>
                            </a>
                        </div>
                        <div className="xs-12 lg-6 desc">
                            <div className="card-white no-rotate">
                                <h5>{ item.tour.name }</h5>
                                <p>{ item.tour.short_description }</p>
                                <a href={ link }>READ MORE</a>
                            </div>
                        </div>
                        <div className="xs-12 lg-3 selection">
                            { selection }
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="container cart-wrapper">
                <h4>YOUR CART: <big>{ count }</big> ITEM{ (count > 1) && 'S' }</h4>
                { itemsJSX }
                <div className="row">
                    <div className="xs-12 lg-offset-9 lg-3 cart-total">
                        TOTAL: <span>${ total }</span>
                    </div>
                </div>
                <div className="row">
                    <div className="xs-12 lg-offset-9 lg-3">
                        <a href="/checkout/" className="btn-green btn-block">CHECKOUT NOW</a>
                    </div>
                </div>
                <SweetAlert { ...swal } />
            </div>
        );
    }
}
