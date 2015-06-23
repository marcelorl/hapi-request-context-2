'use strict';

var createNamespace = require('continuation-local-storage').createNamespace;
var Hoek = require('hoek');
var _ = require('lodash');

		var ns = createNamespace('test-ns');
		var patchBluebird = require('cls-bluebird');
		patchBluebird(ns);
module.exports = {
    register: function (server, options, next) {
		Hoek.assert(options.namespace, new Error('"options.namespace" is required'));
		Hoek.assert(!options.mapHeaders || Array.isArray(options.mapHeaders), new Error('"options.mapHeaders" is required to be an Array if set'));

        server.ext('onRequest', function (req, reply) {
            ns.run(function () {
				if(options.mapHeaders && options.mapHeaders.length) {
					_.each(options.mapHeaders, function(header) {
						console.log('Check header: ' +header);
						console.dir(req.headers);
						if (req.headers[header]) {
							console.log('Setting ctx: ' + header + ' => ' + req.headers[header]);
							ns.set(header, req.headers[header]);
						}
					});
                }
                reply.continue();
            });
        });

        next();
    }
};

module.exports.register.attributes = {
    name: 'hapi-request-context'
};
