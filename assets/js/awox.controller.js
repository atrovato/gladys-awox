
(function () {
  'use strict';

  angular
    .module('gladys')
    .controller('AwoxController', AwoxController);

  AwoxController.$inject = ['deviceService', 'roomService', 'awoxService', '$translate', '$scope'];

  function AwoxController(deviceService, roomService, awoxService, $translate, $scope) {
    var vm = this;
    vm.scan = scan;
    vm.createDevice = createDevice;
    vm.updateDevice = updateDevice;
    vm.selectDevice = selectDevice;
    vm.createMeshDevice = createMeshDevice;

    vm.scanning = false;
    vm.available = false;
    vm.install = false;
    vm.error = null;
    vm.mError = null;
    vm.devices = [];
    vm.rooms = [];
    vm.selectedDevice = null;
    vm.progess = false;
    vm.remotes = [];

    activate();

    function activate() {

      io.socket.on('awoxDiscover', function (params) {
        $scope.$apply(function () {
          vm.devices = params;
          if (params.length === 0) {
            $translate('SCAN_NO_FOUND').then((msg) => {
              manageError(msg);
            });
          } else {
            manageError(null);
          }
        });
      });

      io.socket.on('awoxStatus', function (params) {
        $scope.$apply(function () {
          vm.available = params.bluetoothOn;
          vm.scanning = params.scanning;
          vm.install = params.install;
        });
      });

      io.socket.on('awoxPair', function (params) {
        $scope.$apply(function () {
          vm.error = null;
          vm.mError = null;
          vm.progess = false;
          $('#modalMesh').modal('hide');
        });
      });

      io.socket.on('awoxError', function (params) {
        $scope.$apply(function () {
          manageError(params);
        });
      });

      awoxService.setup()
        .then(function (result) {
          manageResult(result);
        });

      roomService.get({ take: 10000 })
        .then(function (data) {
          vm.rooms = data.data;
          vm.rooms.unshift({ id: null, name: '----' });
        });

      awoxService.getRemotes()
        .then(function (data) {
          vm.remotes = data.data;
          vm.remotes.unshift({ id: null, identifier: '', name: '' });
        });
    }

    function manageResult(result) {
      if (result.status != 200) {
        vm.devices = [];
        vm.available = false;
        $translate('SERVICE_FAIL').then((msg) => {
          manageError(msg);
        });
      } else {
        vm.available = result.data.bluetoothOn;
        vm.scanning = result.data.scanning;
        vm.install = result.data.install;
      }
    }

    function scan() {
      vm.devices = [];

      return awoxService.scan()
        .then(function (result) {
          manageResult(result);
        });
    }

    function createDevice(device) {
      vm.progess = true;
      updateTypesName(device);
      deviceService.create(device).then(() => {
        vm.progess = false;
        device.alreadyExists = true;
        $('#modalMesh').modal('hide');
      }).catch((e) => {
        manageError(e);
        vm.progess = false;
      });
    }

    function updateDevice(device) {
      vm.progess = true;
      updateTypesName(device);
      deviceService.updateDevice(device).then(() => {
        vm.progess = false;
        $('#modalMesh').modal('hide');
      }).catch((e) => {
        manageError(e);
        vm.progess = false;
      });
    }

    function createMeshDevice(device) {
      vm.progess = true;
      updateTypesName(device);
      awoxService.createDevice(device).then(() => {
        vm.progess = false;
      }).catch((e) => {
        manageError(e);
        vm.progess = false;
      });
    }

    function selectDevice(device) {
      vm.selectedDevice = device;
    }

    function updateTypesName(deviceGroup) {
      deviceGroup.types.forEach(element => {
        element.name = deviceGroup.device.name + element.nameSuffix;
      });
    }

    function manageError(e) {
      if ($('#modalMesh').hidden) {
        vm.error = e;
        vm.mError = null;
      } else {
        vm.error = null;
        vm.mError = e;
      }
    }
  }
})();