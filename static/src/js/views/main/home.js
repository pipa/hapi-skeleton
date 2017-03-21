// Load Modules =================================
import Grid from '../../components/tours/Grid.js';
import '../../libs/slick.js';

// Slider Implementation ========================
$('.slick').slick({
    autoplay: true,
    dots: true
});

// Render tour grid =============================
ReactDOM.render(
    <Grid tours={ _app.page.tours } isSlider />,
    document.getElementById('js-featured-tours')
);
