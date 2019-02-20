const shared = require('../lib/shared.js');

module.exports = {
  generateStatus: function (status = {}) {
    status.bluetoothOn = shared.bluetoothOn;
    status.scanning = shared.scanning;
    return status;
  },
  getModuleId: function () {
    return gladys.module.get()
      .then(modules => {
        for (let module of modules) {
          if (module.slug == 'awox') {
            return Promise.resolve(module.id);
          }
        }
      });
  }
};