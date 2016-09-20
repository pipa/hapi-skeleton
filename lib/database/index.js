
// loading modules ================================================
const Mongoose = require('mongoose');

// declaring the database class ==================================
class Database {
     constructor(host, db, port) {
        this.host = host;
        this.db = db;
        this.port = port;
        this.connection;
        this.changeState(`initializing`);
       
    };

    // closing the connection method ===========================
    closeConnection() {
        // we;re going to kill the process
        process.exit(0);
        this.changeState(`Clossing connection to ${this.db}`);
    }

    // conect to the db =======================================
    get connect() {
        // this method will connect to the db
        Mongoose.connect(`mongodb://${this.host}:${this.port}/${this.db}`);
        this.connection = Mongoose.connection;

        // now were checking if anything if good
        this.connection.on('error', () => {
            this.changeState(`Error connecting to db: ${this.db}`);
            this.closeConnection();
        });

        // if everything is good 
        this.connection.on('open', () => {
            this.changeState(`Connection to db: ${this.db} success`);

        });

        // if nodejs crash or process end close everything
        process.on('SIGINT', () => {
            this.changeState(`Mongoose disconnect on db termination`);
            this.closeConnection();
        });
    }

    // change state method only to log some infomaron ==========
    changeState(newState) {
        if(newState !== this.state) {
            this.state = newState;
            console.log(`${this.state}`);
        }
    }
};

// exposing the class ===========================================
module.exports = Database;