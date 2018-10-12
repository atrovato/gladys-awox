# gladys-awox
Managing Awox light devices with Gladys

## Installation
To allow the node process to access bluetooth withou sudo rights, execute : 

```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

After installation is done and Gladys restarted, simply configure the module to create Awox Gladys devices according to physical devices detected.


## Compatibility
Following devices have been tested :
 * SmartLIGHT c7 : on/off, brightness, color
 * SmartLIGHT w9 : on/off, brightness

## Awaited functionalities
 - [x] Swith on/off
 - [x] Use with Gladys as binary device to switch on/off
 - [X] Auto-detect devices
 - [x] Manage RGB skill
 - [x] Manage ligth intensity
 - [ ] Reset default light state

## Limitations
 - Do not work when [Gladys-bluetooth](https://github.com/GladysProject/gladys-bluetooth) is enabled