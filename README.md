# hapi-skeleton

HapiJS boilerplate starting point for my projects

### Built With

* [hapi](https://hapijs.com/) - A rich framework for building applications and services


### Usage

Just clone the repo:
```bash
$ git clone https://github.com/pipa/hapi-skeleton.git
$ cd hapi-skeleton
$ npm install
```
and start coding!


To run the app:
```bash
$ npm start
```

To run tests:
```bash
$ npm test
```

### Plugins

- **glue** - Server composer for hapi.js. https://github.com/hapijs/glue

### Project Structure
```
.
├── lib/
|   ├── controllers/
|   ├── model/
|   ├── plugins/
|   ├── routes/
|   |   └── home.js   * Sample handler
|   └── index.js      * REST routes
├── test/
|   └── api.js        * API test
├── .babelrc
├── .eslintrc
├── .eslintignore
├── index.js         * Server definition (uses the Glue plugin to read a manifest)
├── config.js           * Auth strategies
└── package.json
```

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

### Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc
