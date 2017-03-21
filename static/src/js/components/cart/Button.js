// Deps =========================================
import $ from 'jquery';
import React from 'react';

// Internal =====================================
const { Component } = React;

// Quick Quote Component Class ==================
export default class CartBtn extends Component {

    constructor(props) {

        super(props);

        //== Init state
        this.state = {
            hasSome: 0
        };

        //== Check if we have items
        if ('cart' in localStorage) {
            this.state.hasSome = JSON.parse(localStorage.cart).items.length;
        }

        //== Subscribing to Cart's data methods
        $.subscribe('cart.update', this.updateCart.bind(this));

        this._bind('handleClick');
    }

    handleClick() {

        $.publish('cart.show');

        return false;
    }

    updateCart() {

        const hasSome = JSON.parse(localStorage.cart).items.length || 0;

        this.setState({ hasSome });
    }

    render() {

        const { state, handleClick } = this;
        const { hasSome } = state;
        const cartClass = (hasSome) ? 'full' : 'empty';

        return (
            <button className={ `main-cart ${ cartClass }` } onClick={ handleClick } >
                <i className="icon-cart" />
            </button>
        );
    }
}
