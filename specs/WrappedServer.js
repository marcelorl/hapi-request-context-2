'use strict';

var server;
var wrapper;
var confServer;

function WrappedServer(serverPromise) {
	this.serverPromise = serverPromise;
}

WrappedServer.prototype.boot = function () {
	return this.serverPromise
		.then(function (configuredServer) {
			confServer = configuredServer;
			return {
				wrapper: require('./injectWrapper')(configuredServer),
				server: confServer
			};
		});
};

module.exports = WrappedServer;
