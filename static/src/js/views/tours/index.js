// Load Modules =================================
import Filter from '../../components/global/Filter.js';


// Render tour grid =============================
ReactDOM.render(
    <Filter tours={ _app.page.tours } />,
    document.getElementById('js-filter-tours')
);
