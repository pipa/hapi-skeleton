//
// Validations Rules for forms
// - `true` means it pass the rule
// ==============================================

// Deps =========================================
import valid from 'card-validator';

// Local scope ==================================
//== Regular Expresions
const regex = {
    email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    numeric: /^[-+]?(?:\d*[.])?\d+$/,
    alpha: /^[A-Za-z]+$/i,
    alphaNumeric: /^[0-9A-Z]+$/i,
    name: /^[a-z\u00C0-\u02AB'´`]+\.?\s?([a-z\u00C0-\u02AB'´`]+\.?\s?)+$/i
};

// Internals ====================================
const internals = {
    required: {
        rule: value => value.toString().trim(),
        hint: () => (<span className="form-error is-visible">Required field.</span>)
    },
    email: {
        rule: value => regex.email.test(value),
        hint: value => (<span className="form-error is-visible"><b>{value}</b> isnt an Email.</span>)
    },
    ccNumber: {
        rule: value => valid.number(value).isValid,
        hint: () => (<span className="form-error is-visible">Please provide a valid card number.</span>)
    },
    ccExp: {
        rule: value => valid.expirationDate(value).isValid,
        hint: () => (<span className="form-error is-visible">Invalid <b>Date</b>.</span>)
    },
    name: {
        rule: value => regex.name.test(value),
        hint: () => (<span className="form-error is-visible">Please provide a valid name.</span>)
    },
    cvc: {
        rule: (value, components) => {

            const numValidation = valid.number(components.ccNumber.state.value);
            const trimVal = value.replace(/\D/g, '');
            let size = 3;

            if (numValidation.card) {
                size = numValidation.card.code.size;
            }

            return trimVal.length === size;
        },
        hint: (value, components) => {

            const numValidation = valid.number(components.ccNumber.state.value);
            let messageJSX = (<small className="form-error is-visible small">Invalid <b>CVC</b> code.</small>);

            if (numValidation.card) {
                messageJSX = (<small className="form-error is-visible small"><b>{ numValidation.card.code.name }</b> code should be { numValidation.card.code.size } numbers.</small>);
            }

            return messageJSX;
        }
    }
};

// Export Validations ===========================
export default internals;
