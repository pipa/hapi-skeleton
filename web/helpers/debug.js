'use strict';

// Load Modules =================================
const Handlebars = require('handlebars');

// Exposing =====================================
module.exports = function (json) {

    /*
    console.log("Current Context");
    console.log("====================");
    console.log(this);

    if (optionalValue) {
        console.log("Value");
        console.log("====================");
        console.log(optionalValue);
    }
    */

    let result;
    // json = { "test": null, "foo": 123, "Bar": ":)", "hello": false  }
    // json = JSON.parse(json);
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    result = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return `<span class="${ cls }">${ match }</span>`;
    });

    result = `
        <style>
            pre.dev-dump { outline: 1px solid #000009; padding: 5px; margin: 5px; background: #2a333c; color: #f0f0f0; white-space: pre-wrap; }
            .dev-dump .string { color: green; }
            .dev-dump .number { color: darkorange; }
            .dev-dump .boolean { color: #1A8BCB; }
            .dev-dump .null { color: magenta; }
            .dev-dump .key { color: #cb3837; }
        </style>
        <pre class="dev-dump">${ result }</pre>
    `;

    return new Handlebars.SafeString(result);
};