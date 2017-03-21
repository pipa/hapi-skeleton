// Load Modules =================================
import Grid from '../../components/tours/Grid.js';
import Util from '../../modules/utils.js';
import ReactSlider from 'react-slider';

// Internal =================================
const internals = {};
const { Component, PropTypes } = React;

// Find and remove in array =================
internals.arrRemove = (arr, item) => {
    for ( const i in arr ) {
        if ( arr[i] === item ) {
            arr.splice(i, 1);
            break;
        }
    }
};

// Remove duplicated results in array =============
internals.removeDups = (arr) => {
    return [ ...new Set( [].concat( ...arr ) ) ];
};

// merge spaces and lowercase =====================
internals.mergeLowerCase = (name) => {
    return name.replace(' ', '_').toLowerCase();
};

// filter tours function ==========================
internals.filterTours = (tours, filterConcept) => {
    const { filterList, name, priceRange } = filterConcept;
    const { cat, loc } = filterList;
    const tourList = tours;
    const foundToursByPrice = [];
    const foundToursByName = [];
    let foundTours = tourList;
    let foundToursByCat = [];
    let locationName = '';
    let minRate = 0;
    let leTourDeFrance = null;
    let filterElem;
    const cb = (el) => {
        const foundLocations = [];

        for (let j = 0, locsLen = el.locations.length; j < locsLen; ++j) {
            locationName = internals.mergeLowerCase(el.locations[j].location.name);
            foundLocations.push((locationName === filterElem));
        }

        return $.inArray(true, foundLocations) >= 0;
    };

    if (cat.length) {
        for (let i = 0, catLen = cat.length; i < catLen; ++i) {
            leTourDeFrance = null;
            leTourDeFrance = tourList.filter((el) => {

                return el.categories[0].toLowerCase() === cat[i];
            });
            foundToursByCat = foundToursByCat.concat(leTourDeFrance);
        }
        foundTours = foundToursByCat;
    }

    if (loc.length) {
        for (let i = 0, catLen = loc.length; i < catLen; ++i) {
            leTourDeFrance = null;
            filterElem = loc[i];
            leTourDeFrance = foundTours.filter(cb);
            foundToursByCat = foundToursByCat.concat(leTourDeFrance);
        }
        foundTours = foundToursByCat;
    }

    if (priceRange.min > 0 && priceRange.max > 0 && priceRange.min < priceRange.max) {
        leTourDeFrance = null;
        leTourDeFrance = foundTours.filter((el) => {
            minRate = Util.getLowestRate(el);

            return priceRange.min <= minRate && minRate <= priceRange.max;
        });
        foundTours = foundToursByPrice.concat(leTourDeFrance);
    }

    if (name.length) {
        leTourDeFrance = null;
        leTourDeFrance = foundTours.filter((el) => {

            return el.name.toLowerCase().indexOf(name.toLowerCase()) >= 0;
        });
        foundTours = foundToursByName.concat(leTourDeFrance);
    }

    foundTours = internals.removeDups(foundTours);

    return foundTours;
};

// Tour Details Component Class =============
export default class FilterWidget extends Component {

    constructor(props) {

        super(props);

        this.state = {
            showFilter: false,
            clsName: 'hide',
            filterConcept: {filterList: {cat: [], loc: []}, name: '', priceRange: {min: 0, max: 0}},
            categories: [],
            locations: [],
            minPrice: 0,
            maxPrice: 0,
            viewmode: 'grid'
        };
        this._bind('handleShow', 'addFilter', 'clearFilters', 'filterText', 'handleRange');

        const ratesArr = [];
        const { state, addFilter } = this;
        const { categories, locations, filterConcept } = state;
        const { priceRange } = filterConcept;
        const { tours } = props;
        let category;
        let tour;
        let location;
        let locationName;
        let minRate;

        this.filterWrapJSX = [];
        this.filtersJSX = [];

        for (let i = 0, toursLen = tours.length; i < toursLen; ++i) {
            tour = tours[i];
            minRate = Util.getLowestRate(tour);
            ratesArr.push(minRate);
            if ($.inArray(tour.categories[0], categories) < 0) {
                categories.push(tour.categories[0]);
            }
            for (let j = 0, locsLen = tour.locations.length; j < locsLen; ++j) {
                location = tour.locations[j].location;
                locationName = location.name.toLowerCase();
                if ($.inArray(locationName, locations) < 0) {
                    locations.push(locationName);
                }
            }
        }

        state.minPrice = Math.min( ...ratesArr );
        state.maxPrice = Math.max( ...ratesArr );

        priceRange.min = state.minPrice;
        priceRange.max = state.maxPrice;

        for (let j = 0, catLen = categories.length; j < catLen; ++j) {
            category = categories[j].toLowerCase();
            this.filtersJSX.push(
              <li className="xs-6 md-4 lg-2" key={ category }>
                <input
                  type="checkbox"
                  name={ category }
                  value={ category }
                  id={ `fltr-${ category }` }
                  ref={ `fltr-${ category }` }
                  data-filter-type="cat"
                  className="fltr-chbx"
                  onClick={ addFilter } />
                <label htmlFor={ `fltr-${ category.toLowerCase() }` }>{ categories[j] }</label>
              </li>
            );
        }

        this.filterWrapJSX.push(<div key={ Util.rand() } className="opt-group"><p>Tour Type</p><ul className="row">{ this.filtersJSX }</ul></div>);
        this.filtersJSX = [];

        for (let k = 0, locsLen = locations.length; k < locsLen; ++k) {
            location = locations[k];
            locationName = location.replace(' ', '_').toLowerCase();
            // TODO: this goes to a function, is the same as above
            this.filtersJSX.push(
                <li className="xs-6 md-4 lg-2" key={ Util.rand() }>
                  <input
                    type="checkbox"
                    name={ locationName }
                    value={ locationName }
                    id={ `fltr-${ locationName }` }
                    ref={ `fltr-${ locationName }` }
                    data-filter-type="loc"
                    className="fltr-chbx"
                    onClick={ addFilter } />
                  <label htmlFor={ `fltr-${ locationName }` }>{ location }</label>
                </li>
            );
        }

        this.filterWrapJSX.push(<div key={ Util.rand() } className="opt-group"><p>Locations</p><ul className="row">{ this.filtersJSX }</ul></div>);
    }

    addFilter(e) {

        const { state, refs } = this;
        const { filterConcept } = state;
        const { value } = e.target;
        const { dataset } = refs[e.target.id];
        const { filterList } = filterConcept;
        const filterArr = filterList[dataset.filterType];

        if ($.inArray(value, filterArr) < 0) {
            filterArr.push(value);
        } else {
            internals.arrRemove(filterArr, value);
        }
        this.setState({filterConcept: filterConcept});
    }

    clearFilters() {

        const { state } = this;
        const { filterConcept } = state;
        const $fltrChbx = $('.fltr-chbx');
        const $searchName = $('.search-name');
        const $ranges = $('input[type=range]');

        filterConcept.name = '';
        filterConcept.priceRange.min = state.minPrice;
        filterConcept.priceRange.max = state.maxPrice;
        for (const type in filterConcept.filterList) {
            if (filterConcept.filterList.hasOwnProperty(type)) {
                filterConcept.filterList[type] = [];
            }
        }

        this.setState({filterConcept: filterConcept});
        // TODO: does this look infected?
        $fltrChbx.prop('checked', false);
        $searchName.val('');
        $ranges.val(filterConcept.priceRange.min);
    }

    filterText(e) {

        const { state } = this;
        const { filterConcept } = state;
        const { value } = e.target;

        filterConcept.name = value;
        this.setState({filterConcept: filterConcept});
    }

    handleShow(e) {

        const { showFilter } = this.state;
        const fltrVisible = !showFilter;
        const clsName = (fltrVisible) ? 'show' : 'hide';

        e.preventDefault();

        this.setState({
            showFilter: fltrVisible,
            clsName: clsName
        });
    }

    handleRange(e) {
        const { state } = this;
        const { filterConcept } = state;

        filterConcept.priceRange.min = e[0];
        filterConcept.priceRange.max = e[1];
        this.setState({filterConcept: filterConcept});
    }

    render() {

        const { props, state, handleShow, clearFilters, filterText, filterWrapJSX, handleRange } = this;
        const { filterConcept, minPrice, maxPrice, viewmode } = state;
        const { filterList, name, priceRange } = filterConcept;
        let { tours } = props;
        let toursJSX = <div className="no-matches"><img src="/static/svg/tumbleweed.svg" className="tumbleweed" /><span>Uh oh... there are no matches for your criteria. :(</span></div>;

        if (filterList.cat.length || filterList.loc.length || name.length || (priceRange.min > 0 && priceRange.max > 0)) {
            tours = internals.filterTours(tours, filterConcept);
        }

        if (tours.length) {
            toursJSX = <Grid tours={ tours } viewmode={ viewmode } />;
        }

        return (
          <div className="tours-list-wrap">
            <div className="fltr-wrap row">
              <div className="xs-12 lg-4">
                <a href="#more-options" id="more-options" className="btn-black more-options" onClick={ handleShow }><i className="icon-filter"/> Filter Results</a>
              </div>
              <div className="xs-12 lg-8 search-wrap">
                <input type="text" name="search" id="search-name" className=" form-control search-name" onChange= { filterText } autoComplete="off" placeholder="Search Tours" />
                <label htmlFor="search-name" className="icon-search-wrap">
                  <i className="icon-search"/>
                </label>
              </div>
              <div className={`${state.clsName} options`}>
                <i className="close-options" onClick={ handleShow }>&times;</i>
                { filterWrapJSX }
                <div className="row actions-wrap">
                  <div className="xs-12 lg-7 price-picker">
                    <div className="range-slider">
                      <ReactSlider min={ minPrice } max={ maxPrice } onChange={ handleRange } defaultValue={ [minPrice, maxPrice] } withBars>
                        <div className="range-tooltip">${ priceRange.min }/PP</div>
                        <div className="range-tooltip">${ priceRange.max }/PP</div>
                      </ReactSlider>
                    </div>
                  </div>
                  <button type="clear" name="clear" className="xs-6 lg-4 xs-offset-6 lg-offset-1 actions btn-black" onClick={ clearFilters }><i className="icon-close"/> Clear All</button>
                </div>
              </div>
            </div>
            <div className="option-wrap row">
              <div className="xs-12 result-count">
                Showing: <span>{ tours.length }</span> tours
              </div>
            </div>
            <div className="row tours-list">
              { toursJSX }
            </div>
          </div>
        );
    }
}
// PropTypes of FilterWidget =================
FilterWidget.PropTypes = {
    tour: PropTypes.object
};
