// Deps =========================================
import SweetAlert from 'sweetalert-react';
import Loader from 'loader';
import GoFetch from 'fetch-wrapper';
import Recaptcha from 'react-recaptcha';

// Internal =====================================
const { Component } = React;
const { Form, Input, Textarea, Button } = Validation.components;
const _fetch = new GoFetch();
const internals = {
    swal: {
        show: false,
        type: 'error',
        title: 'Oops!',
        text: 'It looks like your form contains some errors, there should be an error message on the field(s).'
    }
};

// Exporting Contact Form Class =================
export default class ContactForm extends Component {

    constructor(props) {

        super(props);

        this.isCaptchaValid = false;
        this.state = {
            loading: false,
            swal: internals.swal
        };

        this._bind('handleSubmit', 'handleReset', 'resetForm', 'toggleLoader', 'toggleAlert', 'verifyRecatpchaCallback');

        // Add Recaptcha
        const gRecaptchaScript = document.createElement('script');

        gRecaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit');
        document.head.appendChild(gRecaptchaScript);
    }

    handleSubmit(e) {

        e.preventDefault();

        const { form, toggleLoader, toggleAlert, resetForm, isCaptchaValid } = this;
        let errors = {};

        // Check if captcha is filled
        if (!isCaptchaValid) {
            const alertOpts = {
                show: true,
                type: 'warning',
                title: 'Are you a robot?',
                text: 'We need to verify you\'re not a robot, please check the ReCaptcha\'s checkbox.'
            };

            toggleAlert(alertOpts);

            return false;
        }

        errors = form.validateAll();
        // If there is an input with validations errors, show Alert
        if (Object.keys(errors).length > 0) {
            toggleAlert(Object.assign({}, internals.swal, { show: true }));

            return false;
        }

        toggleLoader(true);
        _fetch.post('/contact', form.components)
            .then((json) => {

                console.log(json);
                if (json.status === 'success') {
                    toggleAlert({
                        show: true,
                        type: 'success',
                        title: 'Thank you!',
                        text: 'We appreciate that you\'ve taken the time to write us. We\'ll get back to you very soon. Please come back and see us often.'
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

    handleReset() {

        const { form, resetForm } = this;

        resetForm(form.components);
    }

    resetForm(components) {

        for (const key in components) {
            if ({}.hasOwnProperty.call(components, key)) {
                components[key].setState({ value: '' });
            }
        }
        this.verifyRecatpchaCallback(false);
    }

    verifyRecatpchaCallback(response) {

        const isValid = (!(typeof response === 'boolean')) ? true : response;

        this.isCaptchaValid = isValid;
    }

    toggleLoader(bool) {

        this.setState({ loading: bool });
    }

    toggleAlert(opts) {

        console.log(opts);
        const swal = Object.assign({}, internals.swal, opts);

        this.setState({ swal });
    }

    render() {

        const { handleSubmit, handleReset, verifyRecatpchaCallback, state } = this;
        const { swal, loading } = state;

        return (
            <Form className="container card card-white-green" ref={ f => { this.form = f; } } onSubmit={ handleSubmit } noValidate>
                <div className="row">
                    <div className="xs-12 md-offset-1 md-10 xl-offset-2 xl-8">
                        <p>Please complete the form below with the required information and our Customer Service Team will review and respond as quickly as possible.</p>

                        <div className="field-wrap row">
                            <label className="form-label xs-12 lg-3">First Name*</label>
                            <Input
                                containerClassName="xs-12 lg-9"
                                className="form-control"
                                type="text"
                                name="firstName"
                                value=""
                                validations={ ['required'] }
                            />
                        </div>
                        <div className="field-wrap row">
                            <label className="form-label xs-12 lg-3">Last Name*</label>
                            <Input
                                containerClassName="xs-12 lg-9"
                                className="form-control"
                                type="text"
                                name="lastName"
                                value=""
                                validations={ ['required'] }
                            />
                        </div>
                        <div className="field-wrap row">
                            <label className="form-label xs-12 lg-3">Email*</label>
                            <Input
                                containerClassName="xs-12 lg-9"
                                className="form-control"
                                type="email"
                                name="email"
                                value=""
                                validations={ ['required', 'email'] }
                            />
                        </div>
                        <div className="field-wrap row">
                            <label className="form-label xs-12 lg-3">Phone*</label>
                            <Input
                                containerClassName="xs-12 lg-9"
                                className="form-control"
                                type="text"
                                name="phone"
                                value=""
                                validations={ ['required'] }
                            />
                        </div>
                        <div className="field-wrap row">
                            <label className="form-label xs-12">Type your message below*</label>
                            <Textarea
                                containerClassName="xs-12"
                                className="form-control"
                                type="text"
                                name="message"
                                value=""
                                validations={ ['required'] }
                            />
                        </div>
                        <div className="row recaptcha-wrap">
                            <Recaptcha
                                ref={ e => { this.recaptchaInstance = e; } }
                                sitekey={ _app.recaptchaKey }
                                render="explicit"
                                onloadCallback={ () => { console.log('done'); } }
                                verifyCallback={ verifyRecatpchaCallback }
                            />
                        </div>
                        <div className="row action-btns">
                            <div className="xs-12 lg-6 xl-offset-4 xl-4">
                                <Button type="button" className="btn btn-default btn-block" disabled={ false } onClick={ handleReset }>Clear Form</Button>
                            </div>
                            <div className="xs-12 lg-6 xl-4">
                                <Button className="btn btn-blue btn-block" disabled={ false }>Submit</Button>
                            </div>
                        </div>
                    </div>
                </div>
                <SweetAlert
                    show={ swal.show }
                    title={ swal.title }
                    type={ swal.type }
                    text={ swal.text }
                    onConfirm={ () => this.toggleAlert({ show: false }) }
                    confirmButtonColor="#00a5e7"
                />
                <Loader
                    show={ loading }
                />

            </Form>
        );
    }
}
