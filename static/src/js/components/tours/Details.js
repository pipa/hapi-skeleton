// Deps =========================================
import _ from 'utils';
import QQ from '../global/QQ.js';
import Slider from 'react-slick';
import RecommendedTours from './Recommended';

// Internal =====================================
const { Component, PropTypes } = React;
const internals = {
    slider: {
        dots: true
    }
};

// Array lists check ============================
internals.doList = (tour, lists) => {

    const result = [];
    let list;
    let _tmps;
    let key;

    for (let n = 0, listLen = lists.length - 1; n <= listLen; ++n) {
        list = lists[n];
        key = tour[list];
        if (key.length) {
            _tmps = [];
            for (let l = 0, keyLen = key.length - 1; l <= keyLen; ++l) {
                _tmps.push(<li key={ `${list}-${l}` }>{ key[l] }</li>);
            }
            result.push(
                <div key={ `sct-${list}` } className="sct">
                    <h3>{ _.capPhrase(list) }</h3>
                    <ul>{ _tmps }</ul>
                </div>
            );
        }
    }

    return result;
};

// Tour Details Component Class =================
export default class TourDetails extends Component {

    static propTypes = {
        tour: PropTypes.object.isRequired,
        isCruise: PropTypes.bool
    };

    static defaultProps = {
        isCruise: false
    };

    constructor(props) {

        super(props);
    }

    render() {

        const { tour, isCruise } = this.props;
        const media = [];
        let _media;
        let alt;
        let jsx = [];

        for (let i = 0, mediaLen = tour.media.length - 1; i <= mediaLen; ++i) {
            _media = tour.media[i];
            if (_media.type === 'image') {
                alt = _media.metas.filter((m) => m.name === 'alt');
                alt = (alt.length === 1) ? alt[0].value : tour.name;
                media.push(<div key={ `img-${i}` }><img src={ _media.url } width="100%" alt={ alt } /></div>);
            }
        }

        // Creating Lists
        jsx = internals.doList(tour, ['what_to_bring', 'additional_info']);

        return (
            <div>
                <div className="tour-det">
                    <div className={ `container ${ !isCruise ? 'card card-white-green' : '' }` }>
                        <header className="row end-xs">
                            {
                                !isCruise ?
                                    <button className="btn-orange btn-sm chat-btn">
                                        <span>HAVE QUESTIONS?</span> <b>CHAT NOW</b> <i className="icon-chat" />
                                    </button>
                                :
                                    <h3>{ tour.name }</h3>
                            }
                        </header>
                        <div className="row pr">
                            <div className="tour-slider xs">
                                <Slider { ...internals.slider }>
                                    { media }
                                </Slider>
                            </div>
                        </div>
                        <div className="row info">
                            <div className={ `xs-12 desc-col ${ !isCruise ? 'lg-8' : null }` }>
                                <div className="sct">
                                    <h3>General Information</h3>
                                </div>
                                <div className="sct">
                                    <p>{ tour.description }</p>
                                </div>
                            </div>
                            { !isCruise &&
                                <div className="xs-12 lg-4">
                                    <QQ tour={ tour } />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <RecommendedTours />
            </div>
        );
    }
}
