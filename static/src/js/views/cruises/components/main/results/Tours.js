// Deps =========================================
import _ from 'utils';
import QQ from '~/static/src/js/components/global/QQ.js';
import TourDetails from '~/static/src/js/components/tours/Details.js';
import Modal from 'modal';

// Internal =====================================
const { Component, PropTypes } = React;

// Quick Quote Component Class ==================
export default class ToursResults extends Component {

    static propTypes = {
        tours: PropTypes.array.isRequired,
        itinerary: PropTypes.object.isRequired
    };

    constructor(props) {

        super(props);
        this._bind('openModal', 'closeModal');
        this.state = {
            isModalOpen: false,
            tour: null
        };
    }

    openModal(e, tour) {

        e.preventDefault();

        this.setState({ isModalOpen: true, tour });
    }

    closeModal() {

        this.setState({ isModalOpen: false });
    }

    render() {

        const { closeModal, openModal } = this;
        const { tours, itinerary } = this.props;
        const { isModalOpen, tour } = this.state;
        let link;
        let style;
        let modalJSX = null;
        const cruise = {
            date: itinerary.date
        };
        const toursJSX = tours.map((_tour, step) => {

            link = `/tour/${ _tour.tour_id }/${ _.urlName(_tour) }/`;
            style = { 'backgroundImage': `url("${ _tour.thumbnail_image }")` };

            return (
                <div key={ `tour-${ step }` }>
                    <div className="row tour-item">
                        <div className="xs-12 lg-3">
                            <a href={ link } className="tour-img" style={ style }>
                                <div className="tour-ribbon">
                                    <div className="tour-price txt-center"><span>Starts From:</span><small>$</small>{ _.getLowestRate(_tour) }</div>
                                </div>
                            </a>
                        </div>
                        <div className="xs-12 lg-5 desc">
                            <div className="card-white no-rotate">
                                <h5>{ _tour.name }</h5>
                                <p>{ _tour.short_description }</p>
                                <a href={ link } onClick={ e => openModal(e, _tour) }>READ MORE</a>
                            </div>
                        </div>
                        <div className="xs-12 lg-4 selection">
                            <div className="card-white no-rotate">
                                <QQ tour={ _tour } cruise={ cruise } />
                            </div>
                        </div>
                    </div>
                </div>
            );
        });

        if (isModalOpen) {
            modalJSX = (
                <Modal isOpen onClose={ closeModal } className="tour-det card card-white-green">
                    <TourDetails tour={ tour } isCruise />
                </Modal>
            );
        }

        return (
            <div className="sched-box">
                { toursJSX }
                { modalJSX }
            </div>
        );
    }
}
