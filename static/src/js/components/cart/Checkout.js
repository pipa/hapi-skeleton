// Deps =========================================
import _ from 'utils';
import moment from 'moment';
import SweetAlert from 'sweetalert-react';
import GoFetch from 'fetch-wrapper';
import Loader from 'loader';
import valid from 'card-validator';

// Internal =====================================
const { Component } = React;
const { Form, Input, Button, Textarea } = Validation.components;
const _fetch = new GoFetch();
const internals = {
    swal: {
        show: false,
        type: 'error',
        title: '😳 Oops!',
        text: 'It looks like your form contains some errors, there should be an error message on the field(s).'
    }
};

// Quick Quote Component Class ==================
export default class CartCheckout extends Component {
    constructor(props) {

        super(props);

        //== Init state
        this.state = {
            loading: false,
            items: [],
            sameName: false,
            swal: Object.assign({}, internals.swal),
            cc: {
                type: '',
                num: '',
                code: {
                    name: 'CVC',
                    size: 3
                }
            }
        };

        //== Check if we have items
        if ('cart' in localStorage) {
            this.state = Object.assign(this.state, JSON.parse(localStorage.cart));
        }

        this._bind('toggleAlert', 'toggleLoader', 'changeCCNumber', 'handleSubmit', 'handleSameName');
    }

    handleSubmit(e) {

        e.preventDefault();

        const { form, toggleLoader, toggleAlert, state } = this;
        const { items } = state;
        const _items = [];
        let errors = {};
        let item;
        // let expDate = null;
        let rates;
        let locations;
        let subtotal;
        let total = 0;

        errors = form.validateAll();
        // If there is an input with validations errors, show Alert
        if (Object.keys(errors).length > 0) {
            toggleAlert(Object.assign({}, internals.swal, { show: true }));

            return false;
        }

        // expDate = valid.expirationDate(form.components.ccExp.state.value);
        for (let i = 0, len = items.length; i < len; ++i) {
            item = Object.assign({}, items[i], {
                first_name: '',
                last_name: ''
            });
            rates = item.selection.rates;
            subtotal = 0;

            console.log(`first_name-${i}`);
            if (`first_name-${i}` in form.components) {
                console.log(form.components[`first_name-${i}`].state.value);
                item.first_name = form.components[`first_name-${i}`].state.value;
            }
            if (`last_name-${i}` in form.components) {
                item.last_name = form.components[`last_name-${i}`].state.value;
            }

            // Get participants
            for (const key in rates) {
                if ({}.hasOwnProperty.call(rates, key)) {
                    locations = rates[key];
                    for (const _key in locations) {
                        if ({}.hasOwnProperty.call(locations, _key)) {
                            subtotal += (locations[_key].price * locations[_key].val);
                        }
                    }
                }
            }
            total += subtotal;

            delete item.isNew;
            delete item.id;
            _items.push(item);
        }
        // console.log(_items);
        // return false;

        const data = {
            email: form.components.email.state.value,
            comments: form.components.comments.state.value,
            total,
            // payment: {
            //     ccType: state.cc.type,
            //     ccNumber: form.components.ccNumber.state.value.replace(/([\s\-])/g, ''),
            //     ccName: form.components.ccName.state.value,
            //     ccExp: {
            //         month: expDate.month,
            //         year: expDate.year
            //     },
            //     ccCode: form.components.ccCode.state.value,

            //     address: form.components.address.state.value,
            //     address2: form.components.address2.state.value,
            //     city: form.components.city.state.value,
            //     country: form.components.country.state.value,
            //     state: form.components.state.state.value,
            //     zip: form.components.zip.state.value
            // }
        };

        data.items = JSON.stringify(_items);
        // data.payment = JSON.stringify(data.payment);

        toggleLoader(true);
        _fetch.post('/reservation', null, data)
            .then((json) => {

                console.log(json);
                if (json.status === 'success') {
                    window.location = `/confirmation/${ json.data.reservation.reservation_id }/`;
                } else {
                    toggleAlert(Object.assign({}, internals.swal, { show: true, text: `The server responded with the following error message: ${ json.message }` }));
                }
            })
            .catch((error) => {

                toggleAlert(Object.assign({}, internals.swal, { show: true, text: `There has been a problem with your fetch operation: ${ error.message }` }));
            })
            .then(() => {
                // Always run this
                toggleLoader(false);
            });

        return true;
    }

    handleSameName(e) {

        const { checked } = e.target;
        const { components } = this.form;
        let value;

        Object.keys(components).forEach((key) => {
            if (/(first_name|last_name)-[1-9]/g.test(key)) {
                value = checked ? components[`${key.replace(/[1-9]/g, '0')}`].state.value : '';
                components[key].setState({ value });
            }
        });

        this.setState({ sameName: checked });
    }

    changeCCNumber(e) {

        let { cc } = this.state;
        const cardNumber = e.target.value;
        const numValidation = valid.number(cardNumber);
        const num = _.ccMask(numValidation, cardNumber);
        let type = '';
        let code = cc.code;

        if (numValidation.card) {
            type = numValidation.card.type;
            code = numValidation.card.code;
        }

        cc = Object.assign({}, cc, { type, num, code });
        this.setState({ cc });
    }

    toggleLoader(bool = false) {

        this.setState({ loading: bool });
    }

    toggleAlert(opts = {}) {

        const swal = Object.assign({}, internals.swal, opts);

        this.setState({ swal });
    }

    render() {

        const { handleSubmit, handleSameName, toggleAlert, changeCCNumber } = this;
        const { items, swal, loading, sameName, cc } = this.state;
        const count = items.length;
        const itemsJSX = [];
        let item;
        let style;
        let link;
        let participants;
        let subtotal;
        let total = 0;
        let rates;
        let sameJSX;
        let validations;
        let readOnly;

        if (count === 0) {
            return (
                <div className="container">
                    <h4>No items</h4>
                </div>
            );
        }

        for (let step = 0; step < count; ++step) {
            item = items[step];
            style = { 'backgroundImage': `url("${ item.tour.thumbnail_image }")` };
            link = `/tour/${ item.tour.tour_id }/${ _.urlName(item.tour) }/`;
            participants = 0;
            subtotal = 0;
            sameJSX = null;
            rates = item.selection.rates[item.selection.location._id];
            validations = sameName ? [] : ['required'];
            readOnly = (step > 0 && sameName) ? true : false;

            // Get participants
            for (const key in rates) {
                if ({}.hasOwnProperty.call(rates, key)) {
                    participants += rates[key].val;
                    subtotal += (rates[key].price * rates[key].val);
                }
            }

            if (step === 0 && count > 1) {
                sameJSX = (
                    <div className="field-wrap row">
                        <label className="form-label xs-12">
                            <Input
                                containerClassName="ib"
                                type="checkbox"
                                name={ 'sameName' }
                                value=""
                                onChange={ handleSameName }
                                validations={ [] }
                            />
                            <b>Use this same name for all my events</b>
                        </label>
                    </div>
                );
                validations = ['required'];
            }

            total += subtotal;

            itemsJSX.push(
                <div key={ `cart-item-${ step }` } className="row tour-item">
                    <div className="xs-12 ttl-main card-white-transparent no-rotate hidden-large-up">{ item.tour.name }</div>
                    <div className="xs-6 lg-3 img-box">
                        <a href={ link } className="tour-img" style={ style } />
                    </div>
                    <div className="xs-12 lg-6 desc card-white-transparent no-rotate">
                        <h5 className="hidden-large-down tour-ttl">{ item.tour.name }</h5>
                        <div className="field-wrap row">
                            <label className="form-label xs-12">Primary Participant First Name *</label>
                            <Input
                                containerClassName="xs-12"
                                className="form-control"
                                type="text"
                                name={ `first_name-${step}` }
                                value=""
                                readOnly={ readOnly }
                                validations={ validations }
                            />
                        </div>

                        <div className="field-wrap row">
                            <label className="form-label xs-12">Primary Participant Last Name *</label>
                            <Input
                                containerClassName="xs-12"
                                className="form-control"
                                type="text"
                                name={ `last_name-${step}` }
                                value=""
                                readOnly={ readOnly }
                                validations={ validations }
                            />
                        </div>
                        { sameJSX }
                    </div>
                    <div className="xs-6 lg-3 price-box card-white-transparent no-rotate">
                        <div className="flex-middle">
                            <p className="xs-12"><b>Date:</b> { moment(item.selection.date).format('DD/MMM/YYYY') }</p>
                            <p className="xs-12"><b>Participants:</b> { participants }</p>
                            <strong className="xs-12">Subtotal: ${ subtotal }</strong>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Form className="container chkt-form" ref={ f => { this.form = f; } } onSubmit={ handleSubmit } noValidate>
                <div className="row">
                    <h4 className="xs-12">PRIMARY PARTICIPANT INFORMATION:</h4>
                    <h5 className="xs-12">Please provide the full name of the primary participant on each of your events</h5>
                </div>

                <div className="cart-box">
                    { itemsJSX }
                </div>

                <div className="row">
                    <a href="/cart/" className="btn-blue btn-block xs-12 lg-offset-9 lg-3"><i className="icon-cart-2" /> Edit <span className="hidden-xlarge-down">Shopping</span> Cart</a>
                </div>

                <div className="row">
                    <h4 className="xs-12">PAYMENT INFORMATION:</h4>
                    <h5 className="xs-12">Please provide the form of payment</h5>
                </div>

                <div className="row card-white-transparent no-rotate pay-info">
                    <div className="xs-offset-1 xs-10">
                        <div className="row">
                            <div className="xs-12 lg-6 col">
                                <div className="row">
                                    <label className="form-label xs-12">Card Type*</label>
                                    <div className="cc-types xs-12">
                                        <div className="row">
                                            <i className={ `xs icon-cc-visa ${ cc.type === 'visa' ? 'active' : null }` } />
                                            <i className={ `xs icon-cc-mastercard ${ cc.type === 'master-card' ? 'active' : null }` } />
                                            <i className={ `xs icon-cc-amex ${ cc.type === 'american-express' ? 'active' : null }` } />
                                            <i className={ `xs icon-cc-discover ${ cc.type === 'discover' ? 'active' : null }` } />
                                            <i className={ `xs icon-cc-jcb ${ cc.type === 'jcb' ? 'active' : null }` } />
                                            <i className={ `xs icon-cc-diners-club ${ cc.type === 'diners-club' ? 'active' : null }` } />
                                        </div>
                                    </div>
                                </div>
                                <div className="field-wrap row">
                                    <label className="form-label xs-12">Card Number*</label>
                                    <Input
                                        ref="ccNumber"
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="text"
                                        name="ccNumber"
                                        value={ cc.num }
                                        onChange={ changeCCNumber }
                                        validations={ ['required', 'ccNumber'] }
                                    />
                                </div>
                                <div className="field-wrap row">
                                    <label className="form-label xs-12">Card Holder Name*</label>
                                    <Input
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="text"
                                        name="ccName"
                                        value=""
                                        validations={ ['required', 'name'] }
                                    />
                                </div>
                                <div className="row">
                                    <div className="field-wrap xs-6">
                                        <div className="row">
                                            <label className="form-label xs-12">Expiration Date*</label>
                                            <Input
                                                containerClassName="xs-12"
                                                className="form-control txt-center"
                                                type="text"
                                                name="ccExp"
                                                value=""
                                                placeholder="MM / YY"
                                                minLength="4"
                                                maxLength="7"
                                                validations={ ['required', 'ccExp'] }
                                            />
                                        </div>
                                    </div>
                                    <div className="field-wrap xs-6">
                                        <div className="row">
                                            <label className="form-label xs-12">{ cc.code.name }*</label>
                                            <Input
                                                containerClassName="xs-8"
                                                className="form-control"
                                                type="text"
                                                name="ccCode"
                                                value=""
                                                maxLength={ cc.code.size }
                                                min="0"
                                                max="9999"
                                                validations={ ['required', 'cvc'] }
                                            />
                                            <div className="xs-4 txt-center">?</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xs-12 lg-6 col">
                                <div className="field-wrap row">
                                    <label className="form-label xs-12">Email*</label>
                                    <Input
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="email"
                                        name="email"
                                        value=""
                                        validations={ ['required', 'email'] }
                                    />
                                </div>
                                <div className="field-wrap row">
                                    <label className="form-label xs-12">Address*</label>
                                    <Input
                                        containerClassName="xs-12 address-field"
                                        className="form-control"
                                        type="text"
                                        name="address"
                                        value=""
                                        validations={ ['required'] }
                                    />
                                    <Input
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="text"
                                        name="address2"
                                        value=""
                                        validations={ [] }
                                    />
                                </div>
                                <div className="field-wrap row">
                                    <label className="form-label xs-12">City*</label>
                                    <Input
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="text"
                                        name="city"
                                        value=""
                                        validations={ ['required'] }
                                    />
                                </div>
                                <div className="field-wrap row">
                                    <label className="form-label xs-12">Country*</label>
                                    <Input
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="text"
                                        name="country"
                                        value=""
                                        validations={ ['required'] }
                                    />
                                </div>
                                <div className="field-wrap row">
                                    <label className="form-label xs-12">State*</label>
                                    <Input
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="text"
                                        name="state"
                                        value=""
                                        validations={ ['required'] }
                                    />
                                </div>
                                <div className="field-wrap row">
                                    <label className="form-label xs-12">Zip Code*</label>
                                    <Input
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="text"
                                        name="zip"
                                        value=""
                                        validations={ ['required'] }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="xs-12">
                                <div className="row">
                                    <label className="form-label xs-12">Additional Comments</label>
                                    <Textarea
                                        containerClassName="xs-12"
                                        className="form-control"
                                        type="text"
                                        name="comments"
                                        value=""
                                        validations={ [] }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="xs-12 cart-total">
                        <big>TOTAL:</big> <span>${ total }</span>
                    </div>
                </div>

                <div className="row">
                    <div className="xs-12 txt-center">
                        <div className="field-wrap">
                            <label className="form-label">
                                <Input
                                    containerClassName="ib"
                                    type="checkbox"
                                    name="agree"
                                    value="true"
                                    onChange={ handleSameName }
                                    validations={ ['required'] }
                                />
                                Yes, I have read and accepted the <a href="">Terms And Conditions</a>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="xs-12 lg-offset-2 lg-8 xl-offset-3 xl-6">
                        <Button className="btn-green btn-block btn-xl submit-btn" disabled={ false }>CONFIRM BOOKING</Button>
                    </div>
                </div>

                <Loader show={ loading } />
                <SweetAlert
                    { ...swal }
                    onConfirm={ () => toggleAlert({ show: false }) }
                    onEscapeKey={ () => toggleAlert({ show: false }) }
                    onOutsideClick={ () => toggleAlert({ show: false }) }
                />
            </Form>
        );
    }
}
