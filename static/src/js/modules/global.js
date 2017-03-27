// Load Modules =================================
import CartBtn from '../components/cart/Button.js';
import CartDDL from '../components/cart/DDL.js';
import Subscribe from '../components/global/Subscribe.js';
import _ from 'utils';

// Local scope ==============================
const internals = {
    _class: {
        noScroll: 'no-flow'
    },
    $html: null,
    $mmTrigger: null
};

// Loads all third party code ===============
internals.thirdParty = () => {

    //== Google Tag Manager
    ((w, d, s, l, i) => {

        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const f = d.getElementsByTagName(s)[0];
        const j = d.createElement(s);
        const dl = l !== 'dataLayer' ? '&l=' + l : '';

        j.async = true;
        j.src = '//www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-56XVXT');
};

// Generic event bindings ===================
internals.generalBindings = () => {

    const { $html, $mmTrigger, _class } = internals;

    //== Trigger no-scroll to html when Menu visible
    $mmTrigger.addEventListener('change', () => {

        _.removeClass($html, _class.noScroll);
        if ($mmTrigger.hasAttribute('checked')) {
            _.addClass($html, _class.noScroll);
        }
    });
};

// Global React Components ======================
internals.initJSX = () => {

    const subscribeNodes = document.getElementsByClassName('subscribe-box');

    // Render CartBtn
    ReactDOM.render(
        <CartBtn />,
        document.getElementById('js-cart')
    );
    ReactDOM.render(
        <CartBtn />,
        document.getElementById('js-cart-desktop')
    );

    // Render the Cart View
    ReactDOM.render(
        <CartDDL />,
        document.getElementById('js-cart-ddl')
    );

    // Render Subscribe
    if (subscribeNodes.length) {
        for (let i = 0, len = subscribeNodes.length; i < len; ++i) {
            ReactDOM.render(<Subscribe />, subscribeNodes[i]);
        }
    }

};

// Doc Ready ================================
export default () => {

    const { thirdParty, generalBindings, initJSX } = internals;

    internals.$mmTrigger = document.getElementById('menu-state');
    internals.$html = document.getElementsByTagName('html')[0];

    if (_app.env !== 'dev') {
        thirdParty();
    }

    generalBindings();
    initJSX();
};
