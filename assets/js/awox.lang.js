var translationsEN = {
  SERVICE_FAIL: 'AwoX service not available, please install again',
  SCAN_TITLE: 'Scan for compatible devices',
  SCAN_START: 'Start scan',
  SCAN_RUNNING: 'Scanning...',
  SCAN_UNAVAILABLE: 'Bluetooth not available',
  SCAN_NO_FOUND: 'No devices found',
  DEVICE_CONFIG: 'Configure device',
  switch: 'Switch',
  white_reset: 'White reset',
  brightness: 'Brightness',
  color: 'Color',
  color_reset: 'Color reset',
  preset: 'Preset color sequences',
  reset: 'Device reset (unpair)',
  MESH_PAIR_DESCR: 'To be able to pair an AwoX Mesh device, be sure that the current device is unpaired and wait for it (red ligth).'
};

var translationsFR = {
  SERVICE_FAIL: 'Le service AwoX n\'est pas disponible, vérifiez son installation',
  SCAN_TITLE: 'Analyse des périphériques compatibles',
  SCAN_START: 'Démarrer l\'analyse',
  SCAN_RUNNING: 'Analyse en cours...',
  SCAN_UNAVAILABLE: 'Le Bluetooth n\'est pas actif',
  SCAN_NO_FOUND: 'Aucun périphérique n\'a été trouvé',
  DEVICE_CONFIG: 'Configuration du périphérique',
  switch: 'Interrupteur',
  white_reset: 'Remise à zéro du blanc',
  brightness: 'Luminosité',
  color: 'Couleur',
  color_reset: 'Remise à zéro de la couleur',
  preset: 'Sequences de couleur définies',
  reset: 'Remise à zéro du périphérique (unpair)',
  MESH_PAIR_DESCR: 'Afin de lier correctement un périphérique AwoX Mesh, soyez sûr que celui-ci n\'est pas déjà appairé et qu\'il soit en attente de le dvenir (lumière rouge).'
};

angular
  .module('gladys')
  .config(['$translateProvider', function ($translateProvider) {
    // add translation table
    $translateProvider
      .translations('en', translationsEN)
      .translations('fr', translationsFR);
  }]);