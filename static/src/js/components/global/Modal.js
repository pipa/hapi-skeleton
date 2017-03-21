// Deps =========================================
import _ from 'utils';
import mousetrap from 'mousetrap';

// Internal =====================================
const { Component, PropTypes } = React;

// Modal Component ===========================
export default class Modal extends Component {
    static propTypes = {
        isOpen: PropTypes.bool,
        style: PropTypes.object
    };

    static defaultProps = {
        isOpen: false,
        containerClassName: '',
        overlayClassName: '',
        className: ''
    }

    constructor(props) {

        super(props);
        this.state = {
            height: null
        };

        this._bind('close');
    }

    componentDidMount() {

        const mdlBox = document.getElementsByClassName('mdl-box')[0];
        const height = (mdlBox) ? mdlBox.clientHeight : null;

        mousetrap.bind('esc', this.close);

        this.setState({ height });
    }

    componentWillUnmount() {

        mousetrap.unbind('esc');
    }

    close(e) {

        e.preventDefault();
        const { onClose } = this.props;

        _.removeClass(document.getElementsByTagName('body')[0], 'stop-scrolling');

        if (onClose) {
            onClose();
        }
    }

    render() {

        const { height } = this.state;
        const { isOpen, containerClassName, className, children, noBackdrop, overlayClassName } = this.props;
        const modalStyle = {};
        const backdropStyle = {};

        if (!isOpen) {
            _.removeClass(document.getElementsByTagName('body')[0], 'stop-scrolling');

            return null;
        }

        _.addClass(document.getElementsByTagName('body')[0], 'stop-scrolling');

        if (height) {
            modalStyle.height = `${height}px`;
        }

        return (
            <div className={ `mdl-wrap ${containerClassName}` }>
                <div className={ `mdl-box ${className}` } style={ modalStyle }>
                    { children }
                </div>

                {
                    !noBackdrop
                    && <div className={ `mdl-overlay ${overlayClassName}` } style={ backdropStyle } onClick={ e => this.close(e) }/>
                }
            </div>
        );
    }
}
