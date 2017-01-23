# hapi-skeleton
> HapiJS boilerplate for my projects

[![Build Status](https://travis-ci.org/pipa/hapi-skeleton.svg?branch=master)](https://travis-ci.org/pipa/hapi-skeleton)
[![Dependencies Status](https://david-dm.org/pipa/hapi-skeleton.svg)](https://david-dm.org/pipa/hapi-skeleton)

<!--
### Introduction
-->
### Installing / Getting started

```bash
$ git clone https://github.com/pipa/hapi-skeleton.git
$ cd hapi-skeleton
$ npm install
```

Now you're ready to start coding!

To run the app:
```bash
$ npm start
```

To run tests:
```bash
$ npm test
```

### Plugins

Hapi lets you organize everything into plugins. This allows to easily break your application up into isolated pieces and reusable modules(routes, auth, DB connections, etc.).

List of third-party plugin dependencies used:
- **glue** - Server composer for hapi.js. https://github.com/hapijs/glue
- **hapi-boom-jsend** - I like my JSON responses standardized, this is a wrapper for the [JSend](https://labs.omniti.com/labs/jsend) standard using boom. https://github.com/selfcontained/hapi-boom-jsend
- **vision** - Templates rendering plugin support for hapi.js. https://github.com/hapijs/vision
- **inert** - Static file and directory handlers plugin for hapi.js. https://github.com/hapijs/inert
- **scooter** - Scooter is a User-agent information plugin for hapi. https://github.com/hapijs/scooter
- **yar** - A hapi session plugin and cookie jar. https://github.com/hapijs/yar
- **lout** - API documentation generator for hapi. https://github.com/hapijs/lout

### Project Structure
```
.
├── lib/
|   ├── controllers/
|   |   ├── base.js         * Base Class controller that handles CRUD
|   |   └── user.js         * User controller inherits from ./base.js - When doing an API -
|   ├── model/
|   |   └── user.js         * User model with mongoose
|   ├── plugins/
|   |   ├── auth.js         * Basic auth setup done with JWT
|   |   ├── db.js           * Connection with MongoDB usign mongoose
|   |   ├── heartbeat.js    * HapiJS heartbeat signal
|   |   ├── madero.js       * Logging handling. (outputs key=value pairs **Not JSON**)
|   |   ├── mailer.js       * Plugin used to send emails
|   |   ├── router.js       * Adds all routes found in `/lib/routes/*.js`
|   |   └── shutdown.js     * Gracefully handle shutdowns
|   ├── routes/
|   |   ├── index.js        * Gets all files in directory and creates a structure to access the files
|   |   └── user.js         * Returns an array with the routes for users
|   └── index.js            * Glue compose and server(s) startup
├── logs/                   * Logs will be generated to this directory
├── test/
|   ├── coverage.html       * Webpage auto-generated when doing `npm test`
|   ├── index.js            * Basic Server tests
|   ├── mongo.js            * Mongo connections test
|   └── user.js             * Test /user* endpoints
├── .babelrc
├── .eslintrc
├── .eslintignore
├── index.js                * Server bootstrapping (kickstarts Glue by sending a manifest) - helpful for testing purposes -
├── config.js               * Auth strategies
└── package.json
```

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
