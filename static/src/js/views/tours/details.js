// Load Modules =================================
import TourDetails from '../../components/tours/Details.js';

// Render tour details ==========================
ReactDOM.render(
    <TourDetails tour={ _app.page.tour } />,
    document.getElementById('js-tour-det')
);
