'use strict';

var Hapi = require('hapi');
var bb = require('bluebird');
var WrappedServer = require('./WrappedServer');
var chai = require('chai');
var should = chai.should();
var getNamespace = require('continuation-local-storage').getNamespace;

var handler = function (req, reply) {
	var ns = getNamespace('hapi-request-context');
	reply({
		namespace: ns,
		"app-id": ns.get('app-id'),
		"lang": ns.get('lang')
	});
};

function sertupServer() {
	var server = new Hapi.Server();
	bb.promisifyAll(server);
	server.connection({
		port: process.env.AUTH_PORT || 3000
	});
	return server.registerAsync({
		register: require('../index.js'),
		options: {
			mapHeaders: ['app-id', 'lang']
		}
	}).then(function () {
		server.route({
			method: 'GET',
			path: '/',
			handler: handler
		});
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
		wrapper.injectAsync({
			method: 'GET',
			url: '/'
		}).then(function (res) {
			should.exist(res.result.namespace);

			done();
		}).
		catch (function (err) {
			done(err);
		});
	});

	it('should set header values on namespace', function (done) {
		wrapper.injectAsync({
			method: 'GET',
			url: '/',
			headers: {
				'app-id': 'myID'
			}
		}).then(function (res) {
			should.exist(res.result.namespace);
			res.result['app-id'].should.equal('myID');
			done();
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
});
