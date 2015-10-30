'use strict';

var cls = require('continuation-local-storage');
var createNamespace = cls.createNamespace;
var getNamespace = cls.getNamespace;
var Hoek = require('hoek');
var _ = require('lodash');

var ns = createNamespace('hapi-request-context');
var patchBluebird = require('cls-bluebird');
patchBluebird(ns);
module.exports = {
	register: function (server, options, next) {
		Hoek.assert(!options.mapHeaders || Array.isArray(options.mapHeaders), new Error('"options.mapHeaders" is required to be an Array if set'));

		server.ext('onRequest', function (req, reply) {
			ns.bindEmitter(req.raw.req);
			ns.bindEmitter(req.raw.res);
			ns.run(function () {
				if (options.mapHeaders && options.mapHeaders.length) {
					_.each(options.mapHeaders, function (header) {
						if (req.headers[header]) {
							ns.set(header, req.headers[header]);
						}
					});
				}

				if(options.onRequest) {
					options.onRequest(req, reply);
				} else {
					reply.continue();
				}
			});
		});

		next();
	},
	namespaceName: function() {
		return 'hapi-request-context';
	},
	context: function() {
		return ns;
	}
};

module.exports.register.attributes = {
	name: 'hapi-request-context'
};
