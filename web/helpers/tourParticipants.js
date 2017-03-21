'use strict';

// Exposing =====================================
module.exports = function (selection) {

    const rates = selection.rates;
    let locations;
    let result = 0;

    for (const key in rates) {
        if ({}.hasOwnProperty.call(rates, key)) {
            locations = rates[key];
            for (const _key in locations) {
                if ({}.hasOwnProperty.call(locations, _key)) {
                    result += locations[_key].val;
                }
            }
        }
    }

    return result;
};
