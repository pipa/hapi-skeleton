// Local scope ==================================
const internals = { };

// Get lowest rate ==========================
internals.getLowestRate = (tour) => {

    let result = null;
    let rate;
    let location;

    for (let l = 0, locationsLen = tour.locations.length; l < locationsLen; ++l) {
        location = tour.locations[l];

        for (let m = 0, ratesLen = location.rates.length; m < ratesLen; ++m) {
            rate = location.rates[m];
            if (result === null || result > rate.price) {
                result = rate.price;
            }
        }
    }

    return result;
};

// Global React Components ======================
internals.urlName = (tour) => {

    const name = tour.name ? tour.name : 'roatan-excursion';

    return name.replace(' ', '-').replace(/[^a-zA-Z-]+/g, '');
};

// Capitalize first letters in every word =======
internals.capPhrase = (phrase) => phrase.replace(/_/g, ' ').replace(/\b[a-z](?=[a-z]{2})/g, letter => letter.toUpperCase());

// Format to money ==============================
internals.formatMoney = (num) => num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

// Rand!! wee! ==================================
internals.rand = () => (Math.random().toString(36) + '00000000000000000').slice(2, 8 + 2);

// Search a JSON for specific Keys/Vals =========
internals.searchJSON = (obj, key, val) => {

    let objects = [];

    for (const i in obj) {
        if (!obj.hasOwnProperty(i)) {
            continue;
        }
        if (typeof obj[i] === 'object') {
            objects = objects.concat(internals.searchJSON(obj[i], key, val));
        } else if (i === key && obj[i] === val || i === key && val === '') {
            // if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            objects.push(obj);
        } else if (obj[i] === val && key === '') {
            // only add if the object is not already in the array
            if (objects.lastIndexOf(obj) === -1) {
                objects.push(obj);
            }
        }
    }

    return objects;
};

// Get Items from localStorage ==================
internals.getLocalStorageCart = () => {

    let storage = {};
    let result = [];

    if ('cart' in localStorage) {
        storage = JSON.parse(localStorage.cart);
    }

    result = ('items' in storage) ? storage.items : [];

    return result;
};

// Set Items to LocalStorage ====================
internals.setLocalStorageCart = (items) => {

    localStorage.cart = JSON.stringify({ items });
};

// Set mask for Credit Card Number ==============
internals.ccMask = (numValidation, cardNumber) => {

    const num = cardNumber.replace(/(\-)/g, '');
    let mask = cardNumber;

    if (numValidation.card) {
        const offsets = [0].concat(numValidation.card.gaps).concat([num.length]);
        const components = [];
        let start;
        let end;

        for (let i = 0; offsets[i] < num.length; i++) {
            start = offsets[i];
            end = Math.min(offsets[i + 1], num.length);
            components.push(num.substring(start, end));
        }
        mask = components.join('-');
    }

    return mask;
};

// Check if element contains className ==========
internals.hasClass = (el, className) => {

    if (el.classList) {
        return el.classList.contains(className);
    }

    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

// Adds a className to an element ===============
internals.addClass = (el, className) => {

    if (el.classList) {
        el.classList.add(className);
    } else if (!internals.hasClass(el, className)) {
        el.className += ` ${className}`;
    }
};

// Removes a className to an element ============
internals.removeClass = (el, className) => {

    if (el.classList) {
        el.classList.remove(className);
    } else if (internals.hasClass(el, className)) {
        const reg = new RegExp('(\\s|^)' + className + '(\\s|$)');

        el.className = el.className.replace(reg, ' ');
    }
};

// Export utils =================================
export default internals;
