'use strict';

// Exposing =====================================
module.exports = function (tour) {

    const val = tour.name ? tour.name : 'roatan-excursion';
    const name = val.replace(' ', '-').replace(/[^a-zA-Z-]+/g, '');

    return `/tour/${ tour.tour_id }/${ name }/`;
};
