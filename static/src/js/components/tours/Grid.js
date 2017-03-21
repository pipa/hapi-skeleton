// Deps =========================================
import Tour from './Item.js';
import Slider from 'react-slick';

// Internal =====================================
const { PropTypes } = React;
const internals = {
    slider: {
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 450,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 0,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    }
};

// Tour Grid Component Class ====================
const TourGrid = (props) => {

    const { tours, isSlider, viewmode } = props;
    let toursJSX = [];
    let JSX;
    let tour;

    for (let i = 0, toursLen = tours.length; i < toursLen; ++i) {
        tour = tours[i];
        toursJSX.push(<Tour key={ `tour-${ i }` } tour={ tour } viewmode={ viewmode } />);
    }

    JSX = toursJSX;

    if (isSlider) {
        toursJSX = toursJSX.map((tourJSX, index) => {
            return (<div key={ `slide-${index}` }>{ tourJSX }</div>);
        });
        JSX = (
            <Slider { ...internals.slider }>
                { toursJSX }
            </Slider>
        );
    }

    return (
        <div>
            { JSX }
        </div>
    );
};

// PropTypes of Grid ============================
TourGrid.PropTypes = {
    tours: PropTypes.array.isRequired,
    isSlider: PropTypes.boolean,
    viewmode: PropTypes.string
};

// Default Props of Grid ========================
TourGrid.defaultProps = {
    isSlider: false,
    viewmode: ''
};

// Exposting Dumb Component =====================
export default TourGrid;
