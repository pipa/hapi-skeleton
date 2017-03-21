// Load Modules =================================
import jsend from 'jsend';

// Local scope ==================================
const internals = {
    // apiURL: 'http://54.234.67.54',
    apiURL: 'http://localhost:8085',
    headers: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    },
    normalizeData: (components) => {

        const result = {};

        Object.keys(components).forEach((key) => {
            result[key] = components[key].state.value;
        });

        return result;
    },
    getBody: (data) => {

        let body = '';

        Object.keys(data).forEach((key) => {

            body += `&${key}=${encodeURIComponent(data[key])}`;
        });
        body = body.substr(1); // Removing first character since it is '&'

        return body;
    }
};

export default class goFetch {

    constructor(opts) {

        this.options = Object.assign({}, internals, opts);
    }

    post(urlPath, components = null, data = {}) {

        const method = 'POST';
        const { apiURL, headers } = internals;
        const _data = (components) ? internals.normalizeData(components) : data;
        const body = internals.getBody(_data);

        console.log(_data);

        return fetch(`${ apiURL }${urlPath}`, { headers, method, body })
            .then((response) => {

                if (response.ok) {
                    return response.json();
                }

                return jsend.error('Network response was not ok');
            });
    }
}
