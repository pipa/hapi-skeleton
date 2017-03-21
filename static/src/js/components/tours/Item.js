// Deps =========================================
import _ from 'utils';

// Internal =================================
const { Component, PropTypes } = React;

// Tour Item Component Class ================
export default class TourItem extends Component {

    render() {

        const { tour, viewmode } = this.props;
        const style = {
            'backgroundImage': `url("${tour.thumbnail_image}")`
        };
        let { locationsJSX, layoutClasses } = this;
        let location;

        locationsJSX = [];

        layoutClasses = (viewmode === 'grid') ? '' : '';

        // get all locations
        for (let i = 0, locLen = tour.locations.length; i < locLen; ++i) {
            location = tour.locations[i].location;
            locationsJSX.push(
                <li key={ _.rand() }>
                    { location.name }, { location.city }
                </li>
            );
        }

        return (
            // /tours/{country}/{region}/{location_id}/{id}/{tour-name}
            <div className={ `${ layoutClasses } tour-item ${ viewmode }` }>
                <a href={ `/tour/${tour.tour_id}/${_.urlName(tour)}/` } className="thumb">
                    <div className="tour-img" style={ style }>
                        <div className="tour-ribbon">
                            <div className="tour-price"><span>Starts from:</span><small>$</small>{ _.getLowestRate(tour) }</div>
                        </div>
                    </div>
                    <div className="tour-name">{ tour.name }</div>
                </a>
                <div className="list-details">
                    <div className="title-descr">
                        <span>{ tour.name }</span>
                        <p>{ tour.description }</p>
                        <a href={ `/tour/${tour.tour_id}/${_.urlName(tour)}/` }>READ MORE</a>
                    </div>
                    <div className="location">
                        <i className="icon-pin"/>
                        <ul>
                            { locationsJSX }
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

// PropTypes of Tour Item ===================
TourItem.PropTypes = {
    tour: PropTypes.object.isRequired,
    viewmode: PropTypes.object.string
};

// Prop defs ================================
TourItem.defaultProps = {
    viewmode: 'list'
};
