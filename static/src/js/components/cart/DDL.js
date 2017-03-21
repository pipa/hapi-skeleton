// Deps =========================================
import $ from 'jquery';
import React from 'react';
import _ from 'utils';

// Internal =====================================
const { Component } = React;
const internals = {
    defaults: {
        items: []
    }
};

// Quick Quote Component Class ==================
export default class CartDDL extends Component {

    constructor(props) {

        super(props);

        //== Creating local storage
        localStorage.cart = localStorage.cart || JSON.stringify(internals.defaults);

        //== Init state
        this.state = Object.assign({ visible: false }, JSON.parse(localStorage.cart));

        this._bind('showCart', 'hideCart');

        //== Subscribing to Cart's data methods
        $.subscribe('cart.show', this.showCart);
    }

    showCart(e, items = _.getLocalStorageCart()) {

        this.setState({ items, visible: true });
        $('html, body').animate({
            scrollTop: 0
        });
    }

    hideCart() {

        this.setState({ visible: false });
    }

    render() {

        const { state, hideCart } = this;
        const { items, visible } = state;
        const show = visible ? 'active' : '';
        let bagJSX = (<p className="empty-msg">Your Bag is empty.</p>);
        let count = '';
        let extraCount = 0;
        let tourLen = items.length;
        let item;

        if (tourLen) {
            count = `(${ items.length })`;
            bagJSX = [];

            if (tourLen > 2) {
                tourLen = 3;
                extraCount = items.length - 3;
            }

            for (let i = 0; i < tourLen; ++i) {
                item = items[i];
                bagJSX.push(
                    <a key={ `item-${ i }` } href={ `/tour/${item.tour.tour_id}/${_.urlName(item.tour)}/` } className="cart-tour">
                        <span className="cart-img"><img src={ item.tour.thumbnail_image } alt=""/></span>
                        <span className="cart-name"><b>{ item.tour.name }</b></span>
                    </a>
                );
            }

            if (extraCount > 0) {
                bagJSX.push(<p key="line-msg" className="line-msg"><span>{ extraCount } more item{ (extraCount > 1) ? 's' : '' } in your Bag</span></p>);
            }
            bagJSX.push(<a href="/checkout/" key="checkout-btn" className="btn-blue btn-sm checkout-btn">Check Out</a>);
        }

        return (
            <div className={ `cart-wrap ${ show }` }>
                <div className="curtain" onClick={ hideCart } />
                <aside className="cart-view">
                    <nav className="cart-content">{ bagJSX }</nav>
                    <nav className="cart-nav">
                        <a href="/cart/"><i className="icon-cart" /> Cart { count }</a>
                        <a href=""><i className="icon-heart" /> Favorites</a>
                        <a href=""><i className="icon-shipping" /> Orders</a>
                        <a href=""><i className="icon-settings" /> Account</a>
                        <a href=""><i className="icon-badge-id" /> Sign in</a>
                    </nav>
                </aside>
            </div>
        );
    }
}
