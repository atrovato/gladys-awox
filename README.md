# gladys-awox
Managing Awox light devices with Gladys

## Installation

### Raspberry requirement
Install Raspberry Linux Bluetooth dependencies :

```
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev 
```

To allow the node process to access bluetooth withou sudo rights, execute : 

```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

### Gladys installation
Use the module store to install the module or manually using :
```
Name : AwoX
Version : 2.0.0
URL : https://github.com/atrovato/gladys-awox.git
Slug: awox
```

After installation is done and Gladys restarted, simply configure the module according to following steps:

#### Module configuration
![1. Module configuration](/doc/1.Module_Configuration.png?raw=true "Module configuration")

#### Start analyse
![2. Bluetooth scan](/doc/2.Start_Analyse.png?raw=true "Start analyse")

#### Wait until analyse is done
![1. Bluetooth scanning](/doc/3.Wait_Analyse.png?raw=true "Wait for analyse to be done")

#### Device configuration
![1. Configure device](/doc/4.Configure_Device.png?raw=true "Device configuration")

And fill all information about the device.


## Compatibility
Following devices have been tested :
 * SmartLIGHT c7 : on/off, brightness, color
 * SmartLIGHT w9 : on/off, brightness
 * SmartLIGHT Mesh color : on/off, brightness, color

## Awaited functionalities
 - [x] Swith on/off
 - [x] Use with Gladys as binary device to switch on/off
 - [X] Auto-detect devices
 - [x] Manage RGB skill
 - [x] Manage ligth intensity
 - [x] Reset default light state
 - [ ] White color (from cold to hot)
 - [ ] Feedback / status state

## Limitations
 - Do not work when [Gladys-bluetooth](https://github.com/GladysProject/gladys-bluetooth) is enabled

## More

Translated for Python [Leiaz Python AwoX Mesh Light project](https://github.com/Leiaz/python-awox-mesh-light) to Javascript.

Thanks to [Leiaz](https://github.com/Leiaz).