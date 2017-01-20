// Deps =========================================
const Config = require('~/config');
const Server = require('~/lib');
const Pkg = require('~/package.json');

// internals Declarations =======================
const internals = {
    options: {
        relativeTo: `${ __dirname }/lib`
    }
};

// init the server ==============================
Server.init(Config.get('/manifest'), internals.options, (err, server) => {

    if (err) {
        server.log(['error', 'server', 'start'], {
            desc: `${ Pkg.name.toUpperCase() } could not be started`,
            err
        });

        return false;
    }

    server.app = {
        rootPath: __dirname
    };

    //== Logging start server
    server.log(['server', 'start'], {
        msg: `${ Pkg.name.toUpperCase() } server started`,
        port: server.info.port,
        protocol: server.info.protocol,
        uri: server.info.uri,
        address: server.info.address
    });
});
