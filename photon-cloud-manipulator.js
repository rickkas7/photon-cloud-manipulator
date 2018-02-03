//1. Install dependencies
//npm install

//2. Run the program:
//npm start

const net = require('net');

const config = require('./config');

const argv = require('yargs').argv

const vorpal = require('vorpal')();

var modes = {
	data:true,
	latency:0,
	reject:false
};

var server = net.createServer();

var connections = [];


vorpal
	.command('data [action]', 'Turns data transmissions, both upload and download. Action = [on|off] or omit to toggle.')
	.action(function(args, callback) {
		handleAction(args.action, 'data');
		this.log('data ' + (modes.data ? 'on' : 'off'));
		
		callback();			
	});

vorpal
	.command('disconnect', 'Disconnect cloud connections.')
	.action(function(args, callback) {
		if (connections.length > 0) {
			this.log('disconnecting ' + connections.length + ' connections');
			while(connections.length > 0) {
				var conn = connections.pop();
				conn.client.destroy();
				conn.conn.destroy();
			}
		}
		else {
			this.log('disconnect - no connections');			
		}
		callback();			
	});

vorpal
	.command('latency [ms]', 'Simulate a high-latency network like satellite.')
	.action(function(args, callback) {
		if (args.ms) {
			modes.latency = parseInt(args.ms);
		}
		else {
			modes.latency = 0;
		}
		this.log('latency ' + modes.latency + ' ms');
		callback();			
	});


vorpal
	.command('reject [action]', 'Reject new cloud connections. Action = [on|off] or omit to toggle.')
	.action(function(args, callback) {
		handleAction(args.action, 'reject');
		this.log('reject ' + (modes.reject ? 'on' : 'off'));
		callback();			
	});

vorpal
	.delimiter('$')
	.show();


server.on('connection', function(conn) {
	if (modes.reject) {
		console.log('connection from ' + conn.remoteAddress + ' rejecting');
		conn.destroy();
		return;
	}
	console.log('connection from ' + conn.remoteAddress);
	
	var client = new net.Socket();
	var uploadQueue = [];
	var downloadQueue = [];

	connections.push({conn:conn,client:client});

	client.connect(5683, 'device.spark.io', function() {
		console.log('conencted to cloud');
	});
	
	client.on('data', function(d) {
		if (modes.data) {
			if (modes.latency == 0) {
				console.log('< ' + d.length);
				conn.write(d);
			}
			else {
				console.log('< ' + d.length + ' queued');
				downloadQueue.push(d);
				setTimeout(function() {
					if (downloadQueue.length > 0) {
						var d2 = downloadQueue.shift();
						console.log('< ' + d2.length);
						try {
							conn.write(d2);
						}
						catch(e) {
							downloadQueue.length = 0;
						}
					}
				}, modes.latency);
			}
		}
		else {
			console.log('< ' + d.length + ' discarded');			
		}
	});
	client.on('close', function() {
		console.log('connection to cloud closed');
	});
	
	conn.on('data', function(d) {
		if (modes.data) {
			if (modes.latency == 0) {
				console.log('> ' + d.length);
				client.write(d);
			}
			else {
				console.log('> ' + d.length + ' queued');
				uploadQueue.push(d);
				setTimeout(function() {
					if (uploadQueue.length > 0) {
						var d2 = uploadQueue.shift();
						console.log('> ' + d2.length);
						try {
							client.write(d2);
						}
						catch(e) {
							uploadQueue.length = 0;
						}	
					}
				}, modes.latency);
			}
		}
		else {
			console.log('> ' + d.length + ' discarded');			
		}
	});
	
	conn.on('close', function() {
		console.log('connection closed');
		uploadQueue.length = 0;
		downloadQueue.length = 0;
		client.destroy();
	});
	
	conn.on('error', function(err) {
		console.log('connection error ' + err.message);
		client.destroy();
	});
});

server.listen(5683, function() {
	// 	
});


function handleAction(arg, sel) {
	if (arg === 'on') {
		modes[sel] = true;
	}
	else
	if (arg === 'off') {
		modes[sel] = false;		
	}
	else {
		modes[sel] = !modes[sel];
	}
}
