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

    const appName = Pkg.name.toUpperCase();

    if (err) {
        server.log(['error', 'app', 'start'], {
            message: `${ appName } could not be started`,
            err
        });

        return false;
    }

    server.app = {
        rootPath: __dirname
    };

    //== Logging start server
    server.log(['app', 'start'], {
        message: `${ appName } server started`,
        port: server.info.port,
        protocol: server.info.protocol,
        uri: server.info.uri,
        address: server.info.address
    });
});
