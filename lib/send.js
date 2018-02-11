const noble = require('noble');
const shared = require('./shared.js'); 

module.exports = function (macAddr, msg) {
    sails.log.info('Add command to Awox ' + macAddr + ' (' + msg +')');

    if (!shared.queue[macAddr]) {
        shared.queue[macAddr] = [];
    }
    shared.queue[macAddr].push(msg);

    function start() {
        if (!shared.scanning) {
            noble.startScanning();
        }

        if (shared.scanTimeout) {
            clearTimeout(shared.scanTimer);
        }

        shared.scanTimer = setTimeout(stop, shared.scanTimout);
    }

    function stop() {
        if (shared.scanning) {
            noble.stopScanning();
        }
    }

    start();
};
