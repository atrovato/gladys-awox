(function () {
  'use strict';

  angular
    .module('gladys')
    .factory('awoxService', AwoxService);

  AwoxService.$inject = ['$http'];

  function AwoxService($http) {

    var service = {
      scan: scan,
      setup: setup,
      createDevice: createDevice,
      getRemotes: getRemotes
    };

    return service;

    function scan() {
      return $http({ method: 'POST', url: '/awox/scan' });
    }

    function setup() {
      return $http({ method: 'GET', url: '/awox/setup' });
    }

    function createDevice(device) {
      return $http({ method: 'POST', url: '/awox/create', data: device });
    }

    function getRemotes() {
      return $http({ method: 'GET', url: '/awox/remotes' });
    }
  }
})();