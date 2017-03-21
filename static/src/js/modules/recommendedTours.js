
const containsElements = (a, b) => {
    return a.every(v => {
        return b.indexOf(v) !== -1;
    });
};

// returns a priority array of the given tags sorted by votes, descending.
const getPriorityList = (tags) => {
    const tagsCopy = {...tags};
    const tagKeys = Object.keys(tagsCopy);
    let highest = tagKeys[0];

    tagKeys.forEach(k => {
        if (tagsCopy[k] >= tagsCopy[highest]) {
            highest = k;
        }
    });

    delete tagsCopy[highest];

    if (Object.keys(tagsCopy).length === 0) {
        return [highest];
    }

    return [highest, ...getPriorityList(tagsCopy)];
};

// for each tour, check if it contains a subset of the tag priority list.
// keep reducing the tag priority list after each loop.
const getRecommendedToursByGroupPriority = (tagPriorityList, toursCopy) => {
    const currTour = _app.page.tour;
    const recommended = [];
    const tagPriorityListCopy = [...tagPriorityList];

    for (const tour in toursCopy) {
        if (containsElements(tagPriorityList, toursCopy[tour].tags)
            && toursCopy[tour].tour_id !== currTour.tour_id) {

            recommended.push(toursCopy[tour]);
            delete toursCopy[tour]
        }
    }

    tagPriorityListCopy.pop();

    if (tagPriorityListCopy.length === 0) {
        return [...recommended];
    }

    return [...recommended, ...getRecommendedToursByGroupPriority(tagPriorityListCopy)];
};

// for each priority tag, check if a tour has it, add that tour if it does
const getRecommendedToursBySinglePriority = (tagPriorityList, toursCopy) => {
    const currTour = _app.page.tour;
    const recommended = [];

    tagPriorityList.forEach(tag => {
        for (const tour in toursCopy) {
            if (toursCopy[tour]._id === currTour._id) {
                delete toursCopy[tour];
                continue;
            }
            // check if prio tag is equal to one of the tour's tags
            if (toursCopy[tour].tags.some(t => t === tag)) {
                recommended.push(toursCopy[tour]);
                delete toursCopy[tour];
                continue;
            }
        };
    });

    return recommended;
};

const getRecommendedTours = (tagPriorityList) => {
    const toursCopy = [..._app.page.tours];
    const toursByGroupPriority = getRecommendedToursByGroupPriority(tagPriorityList, toursCopy);
    const toursBySinglePriority = getRecommendedToursBySinglePriority(tagPriorityList, toursCopy);
    
    return [...toursByGroupPriority, ...toursBySinglePriority];
};

const mapNewTagsToVotes = (tags) => {
    const tagsCopy = {...tags};

    _app.page.tour.tags.forEach(t => {
        if (!tagsCopy[t]) {
            tagsCopy[t] = 1;
        } else {
            tagsCopy[t]++;
        }
    });

    return tagsCopy;
}

const getTags = () => {
    if (localStorage.tags && localStorage.tags !== 'undefined') {
        return JSON.parse(localStorage.tags);
    }

    return {};
}

const showRecommendedTours = () => {
    const storedTags = getTags();
    const tags = mapNewTagsToVotes(storedTags);

    // save tags
    localStorage.tags = JSON.stringify(tags);

    // get new recommendations based on tags
    fetch('http://54.234.67.54/tours').then(r => r.json()).then((tours) => {
        const start = new Date();
        const tagPriorityList = getPriorityList(tags);
        const recommendedTours = getRecommendedTours(tagPriorityList);
        
        console.log('Recommender Algorithm:')
        console.group();
        console.log('Found the following recommended tours:')
        console.log(recommendedTours);
        console.log(`recommender algorithm took: ${new Date() - start}ms`);
        console.groupEnd();

        $.publish('recommendations.show', [recommendedTours]);
        localStorage.recommended = JSON.stringify(recommendedTours);
    });
}

export default showRecommendedTours;
