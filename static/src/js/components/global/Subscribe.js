// Deps =========================================
import React from 'react';
import Validation from 'react-validation';
import Rules from 'validationRules';
import SweetAlert from 'sweetalert-react';
import Loader from 'loader';
import GoFetch from 'fetch-wrapper';

// Adding Custom Rules ==========================
Object.assign(Validation.rules, Rules);

// Internal =====================================
const { Component } = React;
const { Form, Input, Button } = Validation.components;
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
export default class Subscibe extends Component {

    constructor(props) {

        super(props);

        this._bind('toggleAlert', 'toggleLoader', 'handleSubmit', 'resetForm');

        const swal = Object.assign({}, internals.swal);

        //== Init state
        this.state = {
            loading: false,
            swal
        };
    }

    handleSubmit(e) {

        e.preventDefault();

        const { form, toggleLoader, toggleAlert, resetForm } = this;
        let errors = {};

        errors = form.validateAll();
        // If there is an input with validations errors, show Alert
        if (Object.keys(errors).length > 0) {
            toggleAlert(Object.assign({}, internals.swal, { show: true }));

            return false;
        }

        toggleLoader(true);
        _fetch.post('/subscribe', form.components)
            .then((json) => {

                console.log(json);
                if (json.status === 'success') {
                    toggleAlert({
                        show: true,
                        type: 'success',
                        title: 'Thank you!',
                        text: 'Your subscription has been confirmed. You\'ve been added to our list and will hear from us soon.'
                    });
                    resetForm(form.components);
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

    resetForm(components) {

        for (const key in components) {
            if ({}.hasOwnProperty.call(components, key)) {
                components[key].setState({ value: '' });
            }
        }
    }

    toggleLoader(bool = false) {

        this.setState({ loading: bool });
    }

    toggleAlert(opts = {}) {

        const swal = Object.assign({}, internals.swal, opts);

        this.setState({ swal });
    }

    render() {

        const { state, handleSubmit, toggleAlert } = this;
        const { swal, loading } = state;

        return (
            <Form className="row card card-white-blue" ref={ f => { this.form = f; } } onSubmit={ handleSubmit } noValidate>
                <div className="xs-12">
                    <h4>Join Our Newsletter</h4>

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
                        <label className="form-label xs-12">Name*</label>
                        <Input
                            containerClassName="xs-12"
                            className="form-control"
                            type="text"
                            name="name"
                            value=""
                            validations={ ['required'] }
                        />
                    </div>

                    <div className="row action-btns">
                        <div className="xs-12">
                            <Button type="submit" className="btn btn-blue btn-block" disabled={ false }>Submit</Button>
                        </div>
                    </div>
                </div>

                <SweetAlert
                    { ...swal }
                    onConfirm={ () => toggleAlert({ show: false }) }
                    onEscapeKey={ () => toggleAlert({ show: false }) }
                    onOutsideClick={ () => toggleAlert({ show: false }) }
                />
                <Loader show={ loading } />
            </Form>
        );
    }
}
