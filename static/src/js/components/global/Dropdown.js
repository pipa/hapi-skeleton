// Internal =====================================
const { Component, PropTypes } = React;

// Dropdown Component ===========================
export default class Dropdown extends Component {
    static propTypes = {
        wrapperClassName: PropTypes.string,
        textClassName: PropTypes.string,
        inputName: PropTypes.string,
        isRequired: PropTypes.bool,
        options: PropTypes.array,
        defaultOption: PropTypes.string,
        changeHandler: PropTypes.func,
        showDefault: PropTypes.bool,
        val: PropTypes.any
    };

    static defaultProps = {
        wrapperClassName: '',
        textClassName: '',
        inputName: '',
        isRequired: false,
        showDefault: true,
        options: [],
        val: '',
        defaultOption: 'Please select an option',
        changeHandler: (evt) => {

            this.setState({ txt: $(evt.target).val() });

            return false;
        }
    }

    constructor(props) {

        super(props);
        this._bind('changeHandler');
        this.state = {
            txt: (props.showDefault) ? 'Please select an option' : props.options[0].name
        };
    }

    preventIOSFocus(e) {

        e.preventDefault();
    }

    changeHandler(e) {

        this.props.changeHandler(e);
        this.state = { txt: $(e.target).children(':selected').text() };
    }

    render() {

        const { props, state, changeHandler, preventIOSFocus } = this;
        const { wrapperClassName, textClassName, val, inputName, isRequired, options, defaultOption, showDefault } = props;
        let { txt } = state;
        const opts = [];
        let sameTxt = false;

        if (showDefault) {
            opts.push( <option key={`${inputName}-default`} value="">{ defaultOption }</option> );
        }

        options.forEach((option, index) => {
            opts.push( <option key={ `${inputName}-${index}` } value={ option.val }>{ option.name }</option> );
            sameTxt = (!sameTxt && option.name === txt) ? true : false;
        });

        if (val === '') {
            txt = (sameTxt) ? txt : options[0].name;
        } else {
            txt = (options.find(el => el.val === val)).name;
        }

        return (
            <div className={ wrapperClassName + ' ddl-wrap field-wrap' }>
                <div className={ textClassName + ' ddl-text'}>{ txt }</div>
                <select
                    name={ inputName }
                    required={ isRequired }
                    onChange={ changeHandler }
                    onFocus={ preventIOSFocus }
                    onBlur={ preventIOSFocus }
                    value={ val } >
                    { opts }
                </select>
            </div>
        );
    }
}
