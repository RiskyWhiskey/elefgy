if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const os          = require('os');
const cluster     = require('cluster');
const express     = require('express');
const path        = require('path');
const helmet      = require('helmet');

const PORT        = process.env.PORT || 5000;
const clusterSize = os.cpus().length;
const app         = express();

// Main process creates workers and listens for their exit
if (cluster.isMaster) {
    console.log('elefgy has started');
    for (let i = 0; i < clusterSize; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        console.log('Worker', worker.process.pid, 'has exited.');
        cluster.fork();
    });

// Each worker creates a server to listen to port
} else {
    app.use(helmet());
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.get('/', (req, res) => {
        res.render('home');
    });
    app.listen(PORT, () => {
        console.log('New worker', process.pid, 'listening on', PORT);
    });
}
