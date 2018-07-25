# gladys-awox
Managing of Awox devices with Gladys

## Installation
To allow the node process to access bluetooth withou sudo rights, execute : 

```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

## Compatibility
Following devices have been tested :
 * SmartLIGHT c7 : on/off, brightness, color
 * SmartLIGHT w9 : on/off, brightness

## Awaited functionalities
 - [x] Swith on/off
 - [x] Use with Gladys as binary device to switch on/off
 - [X] Auto-detect devices
 - [ ] Add Gladys Awox scan option
 - [x] Manage RGB skill
 - [x] Manage ligth intensity
 - ~[ ] Add Gladys box to manage color/brightness~

## Limitations
 - Do not work when [Gladys-bluetooth](https://github.com/GladysProject/gladys-bluetooth) is enabled
 - Only one message / one device at a time