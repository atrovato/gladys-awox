var translationsEN = {
  SERVICE_FAIL: 'AwoX service not available, please install again',
  INFO_TITLE: 'Information',
  INFO_CONTENT: 'Start scan to find available AwoX devices and configure each to manage them with Gladys.',
  INFO_REMOTE_TITLE: 'Remote usage',
  INFO_REMOTE: 'If you want to manage lights with Gladys and with the remote, please follow instructions:',
  INFO_REMOTE_1: 'reset lights from remote (hold PowerON + Fav. 1)',
  INFO_REMOTE_2: 'reset remote (hold PowerON + Color Cycle)',
  INFO_REMOTE_3: 'link lights to the remote (hold PowerON)',  
  INFO_REMOTE_4: 'activate remote pairing mode (hold PowerON + Bleu)',
  INFO_REMOTE_5: 'add remote to Gladys (remote red light should blink, if not, start again from step 4)',
  INFO_REMOTE_6: 'then add lights to Gladys, and add remote option', 
  SCAN_TITLE: 'Scan for compatible devices',
  SCAN_START: 'Start scan',
  SCAN_RUNNING: 'Scanning...',
  SCAN_UNAVAILABLE: 'Bluetooth not available',
  SCAN_NO_FOUND: 'No devices found',
  DEVICE_CONFIG: 'Configure device',
  DEVICE_EXISTS: 'Device already exists in Gladys',
  switch: 'Switch',
  white_reset: 'White reset',
  brightness: 'Brightness',
  color: 'Color',
  color_reset: 'Color reset',
  preset: 'Preset color sequences',
  reset: 'Device reset (unpair)',
  color_brightness: 'Color brightness',
  white_brightness: 'White brightness',
  white_temperature: 'White temperature',
  MESH_PAIR_TITLE: 'Pairing Mesh lights',
  MESH_PAIR_DESCR: 'To be able to pair an AwoX Mesh device, be sure that the current device is unpaired and wait for it (red ligth).',
  AWOX_RESET_OFFICIAL_VIDEO: 'See official AwoX video',
  SWITCH_ON_OFF: 'Switch ON / OFF'
};

var translationsFR = {
  SERVICE_FAIL: 'Le service AwoX n\'est pas disponible, vérifiez son installation',
  INFO_TITLE: 'Informations',
  INFO_CONTENT: 'Démarrez l\'analyse afin de rechercher les périphériques AwoX disponibles, et de les configurer afin de les manipuler avec Gladys.',
  INFO_REMOTE_TITLE: 'Utilisation d\'une télécommande',
  INFO_REMOTE: 'Si vous souhaitez ajouter la gestion d\'ampoules AwoX dans Gladys, tout en conservant le contrôle avec la télécommande, il vous faut suivre les instructions suivantes :',
  INFO_REMOTE_1: 'remise à zéro de l\'ampoule depuis la télécommande (appui long sur les boutons PowerON + Fav. 1)',
  INFO_REMOTE_2: 'remise à zéro de la télécommande (appui long sur les boutons PowerON + Color Cycle)',
  INFO_REMOTE_3: 'liez à nouveau l\'ampoule à la télécommande (appui long sur le bouton PowerON)',  
  INFO_REMOTE_4: 'activation du mode appairage Bluetooth de la télécommande (appui long sur les boutons PowerON + Bleu)',
  INFO_REMOTE_5: 'ajoutez la télécommande dans Gladys (le bouton rouge de la télécommande doit clignoter, sinon recommancez l\'étape 4)',    
  INFO_REMOTE_6: 'enfin ajoutez les ampoules dans Gladys, en les reliant à la télécommande',    
  SCAN_TITLE: 'Analyse des périphériques compatibles',
  SCAN_START: 'Démarrer l\'analyse',
  SCAN_RUNNING: 'Analyse en cours...',
  SCAN_UNAVAILABLE: 'Le Bluetooth n\'est pas actif',
  SCAN_NO_FOUND: 'Aucun périphérique n\'a été trouvé',
  DEVICE_CONFIG: 'Configuration du périphérique',
  DEVICE_EXISTS: 'Périphérique déjà présent dans Gladys',
  switch: 'Interrupteur',
  white_reset: 'Remise à zéro du blanc',
  brightness: 'Luminosité',
  color: 'Couleur',
  color_reset: 'Remise à zéro de la couleur',
  preset: 'Sequences de couleur définies',
  reset: 'Remise à zéro du périphérique (unpair)',
  color_brightness: 'Intensité de la couleur',
  white_brightness: 'Intensité du blanc',
  white_temperature: 'Température du blanc',
  MESH_PAIR_TITLE: 'Appairer les ampoules Mesh',
  MESH_PAIR_DESCR: 'Afin de lier correctement un périphérique AwoX Mesh, soyez sûr que celui-ci n\'est pas déjà appairé et qu\'il soit en attente de le devenir (lumière rouge).',
  AWOX_RESET_OFFICIAL_VIDEO: 'Voir la vidéo officielle AwoX',
  SWITCH_ON_OFF: 'Allumer / éteindre'
};

angular
  .module('gladys')
  .config(['$translateProvider', function ($translateProvider) {
    // add translation table
    $translateProvider
      .translations('en', translationsEN)
      .translations('fr', translationsFR);
  }]);