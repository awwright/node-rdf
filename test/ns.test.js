var assert = require('assert');
var rdf = require('..');

describe('ns', function(){
	it('rdf.ns', function(){
		var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
		assert.equal(foaf('name'), 'http://xmlns.com/foaf/0.1/name');
	});
	it('rdf.ns expects string', function(){
		assert.throws(function(){
			rdf.ns(1);
		});
	});
	it('rdf.ns output function expects string', function(){
		var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
		assert.throws(function(){
			foaf(2);
		});
	});
});
describe('ns builtins', function(){
	it('rdf.rdfns', function(){
		assert.equal(rdf.rdfns('type'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
	});
	it('rdf.rdfsns', function(){
		assert.equal(rdf.rdfsns('Class'), 'http://www.w3.org/2000/01/rdf-schema#Class');
	});
	it('rdf.xsdns', function(){
		assert.equal(rdf.xsdns('integer'), 'http://www.w3.org/2001/XMLSchema#integer');
	});
});
