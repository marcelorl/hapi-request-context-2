'use strict';

var bb = require('bluebird');

module.exports = function injectWrapper(server) {
	var inject = {
		inject: function (args, cb) {
			server.inject(args, function (res) {
				cb(null, res);
			});
		}
	};
	bb.promisifyAll(inject);

	return inject;
};
