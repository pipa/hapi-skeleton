// Load Modules =================================
import CruisesView from './components/main/CruisesView.js';


// Render tour grid =============================
ReactDOM.render(
    <CruisesView ports={ _app.page.ports || [] } cruiseLines={ _app.page.cruiseLines || [] } />,
    document.getElementById('js-cruise-box')
);
