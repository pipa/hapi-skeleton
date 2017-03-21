// Deps =========================================
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Validation from 'react-validation';
import Rules from 'validationRules';
import 'whatwg-fetch';
import './libs/pubsub.js';

// Adding Custom Rules ==========================
Object.assign(Validation.rules, Rules);

// Adding _bind helper to Components ============
React.Component.prototype._bind = function _bind(...methods) {

    methods.forEach((method) => {

        this[method] = this[method].bind(this);
    });
};

// Setting Global Vars ==========================
Object.assign(window, { React, ReactDOM, $, jQuery: $, Validation });

// Modules ======================================
import runGlobal from './modules/global';

// Kickstart app ================================
$(() => {

    runGlobal();
});
