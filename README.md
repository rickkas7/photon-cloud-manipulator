# Photon cloud manipulator

*Simple tool to simulate various cloud connection issues*

## What it does

This is a node.js server that normally forwards cloud connections and data to the real cloud. But it also has the ability to disconnect cloud connections, stop data from flowing, reject making new connections, and simulate a high-latency connection like satellite.

It's an interactive command prompt application, so you start it up and type commands to change the behavior in real time.

## Set up your device

The first thing you need to do is change your device to point at the server. 

- Note the IP address of the computer you're running the node.js server on.
- Put the Photon in DFU mode (blinking yellow)
- Run the command:

```
particle keys server rsa.pub.der 192.168.2.4
```

The rsa.pub.der file is the public server key of the real Particle cloud server. It's included in the photon-cloud-manipulator directory so you don't need to download it separately.

Replace 192.168.2.4 with the IP address of your server.


## Run it!

- Install [nodejs](https://nodejs.org/) if you haven't already done so. I recommend the LTS version.
- Download this repository.
- Install the dependencies

```
cd photon-cloud-manipulator
npm install
```

- Run the program:

```
npm start
```

It should output something like this when you start it and a Photon makes a connection:

```
$ npm start

> photon-cloud-manipulator@0.0.1 start /Users/rickk/Documents/src/photon-cloud-manipulator
> node photon-cloud-manipulator.js

$ connection from ::ffff:192.168.2.42
conencted to cloud
< 40
> 256
< 384
> 18
> 18
< 18
> 50
> 136
< 18
< 18
< 18
< 18
> 82
< 18
> 466
```

The numbers are the number of bytes transmitted. 

\< is cloud to device

\> is device to cloud

## Commands

Enter commands at the $ prompt. Note that completion is provided, so you can just type "di" then tab and it will fill in disconnect for you.

### data [on|off]

The data command turns on and off data in both directions (upload and download). Omitting on or off toggles the current state.

### disconnect

Disconnects the current Photons. They will likely reconnect immediately, see also reject.

### exit

Exit the program. You can also use quit or Ctrl-C (twice).

### help

List commands.

### latency <ms>

Set latency in milliseconds, typically used to simulate networks with high latency, like satellite Internet.

Setting ms to 0 turns off high latency mode, the default mode. Setting it higher than about 750 milliseconds will likely make connections impossible, due to the way the CoAP timeouts are set.

### reject [on|off]

Turns on or off data rejecting new connections. Omitting on or off toggles the current state.

The connections aren't really rejected in the TCP sense of port not bound; the connection is allowed, then immediately closed. But the end result is similar.


## Restore your device

To put the Photon back to normal cloud mode run the command with no additional options.

```
particle keys server
```


