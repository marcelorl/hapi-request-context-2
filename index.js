'use strict';

const cls = require('cls-hooked');
const { createNamespace } = cls;
const Hoek = require('hoek');

const ns = createNamespace('hapi-request-context');
const patchBluebird = require('cls-bluebird');
patchBluebird(ns);
module.exports = {
	register: function (server, options, next) {
		Hoek.assert(!options.mapHeaders || Array.isArray(options.mapHeaders), new Error('"options.mapHeaders" is required to be an Array if set'));

		server.ext('onRequest', function (req, reply) {
			ns.bindEmitter(req.raw.req);
			ns.bindEmitter(req.raw.res);
			ns.run(function () {
				if (options.mapHeaders && options.mapHeaders.length) {
					options.mapHeaders.map(function (header) {
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
