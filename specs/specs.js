'use strict';

var Hapi = require('hapi');
var bb = require('bluebird');
var WrappedServer = require('./WrappedServer');
var chai = require('chai');
var should = chai.should();
var getNamespace = require('cls-hooked').getNamespace;

function sertupServer(options) {
	var server = new Hapi.Server();
	bb.promisifyAll(server);
	server.connection({
		port: process.env.AUTH_PORT || 3000
	});
	return server.registerAsync({
		register: require('../index.js'),
		options: options || {
			mapHeaders: ['app-id', 'lang']
		}
	}).then(function () {
		return server;
	});
}

describe('Setting up CLS context on request', function () {
	var server;
	var wrapper;
	beforeEach(function (done) {
		new WrappedServer(sertupServer()).boot()
			.then(function (ws) {
				wrapper = ws.wrapper;
				server = ws.server;
				done();
			}).
		catch (function (err) {
			done(err);
		});
	});

	it('should estalish CLS context on each request', function (done) {
		server.route({
			method: 'GET',
			path: '/test',
			handler: function (req, reply) {
				should.exist(getNamespace('hapi-request-context'));
				reply();
			}
		});

		server.route({
			method: 'POST',
			path: '/test',
			handler: function (req, reply) {
				should.exist(getNamespace('hapi-request-context'));
				reply();
			}
		});
		wrapper.injectAsync({
			method: 'GET',
			url: '/test',
			headers: {
				'app-id': 'myID'
			}
		}).then(function() {
			return wrapper.injectAsync({
				method: 'GET',
				url: '/test',
				headers: {
					'app-id': 'myID'
				}
			});
		}).then(function() {
			done();
		}).catch (function (err) {
			done(err);
		});
	});

	it('should set header values on namespace', function (done) {
		server.route({
			method: 'GET',
			path: '/test',
			handler: function (req, reply) {
				getNamespace('hapi-request-context').get('app-id').should.equal('myID');
				done();
				reply();
			}
		});

		wrapper.injectAsync({
			method: 'GET',
			url: '/test',
			headers: {
				'app-id': 'myID'
			}
		}).
		catch (function (err) {
			done(err);
		});

	});

	it('".namespaceName()" returns "hapi-request-context"', function () {
		require('../index').namespaceName().should.equal('hapi-request-context');
	});

	it('".context()" returns the cls namespace when called in the request hanlder', function (done) {
		server.route({
			method: 'GET',
			path: '/test2',
			handler: function (req, reply) {
				require('../index').context().get('app-id').should.equal('myID');
				done();

				reply();
			}
		});

		wrapper.injectAsync({
			method: 'GET',
			url: '/test2',
			headers: {
				'app-id': 'myID'
			}
		}).
		catch (function (err) {
			done(err);
		});
	});

	describe('Request hook', function () {
		var wasCalled;

		function requestHook(req, reply) {
			wasCalled = true;
			reply.continue();
		}

		beforeEach(function (done) {
			new WrappedServer(sertupServer({
				onRequest: requestHook
			})).boot()
				.then(function (ws) {
					wrapper = ws.wrapper;
					server = ws.server;
					done();
				}).
			catch (function (err) {
				done(err);
			});
		});

		it('"options.onRequest(request, reply)" hook should be called when configured', function (done) {
			server.route({
				method: 'GET',
				path: '/test2',
				handler: function (req, reply) {
					reply();
				}
			});

			wrapper.injectAsync({
				method: 'GET',
				url: '/test2',
				headers: {
					'app-id': 'myID'
				}
			}).then(function () {
				wasCalled.should.be.true;
				done();
			}).catch (function (err) {
				done(err);
			});
		});
	});
});
