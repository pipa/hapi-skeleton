// Deps =========================================
import React from 'react';
import ReactDOM from 'react-dom';
import Validation from 'react-validation';
import Rules from 'validationRules';
import pubsub from './libs/pubsub.js';
import 'whatwg-fetch';

// Adding Custom Rules ==========================
Object.assign(Validation.rules, Rules);

// Adding _bind helper to Components ============
React.Component.prototype._bind = function _bind(...methods) {

    methods.forEach((method) => {

        this[method] = this[method].bind(this);
    });
};

// Setting Global Vars ==========================
Object.assign(window, { React, ReactDOM, Validation, pubsub });

// Modules ======================================
import runGlobal from './modules/global';

// Kickstart app ================================
(() => {

    runGlobal();
})();
