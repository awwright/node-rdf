
var assert = require('assert');
var rdf = require('..');

/*
[NoInterfaceObject]
interface PrefixMap {
    omittable getter DOMString get (DOMString prefix);
    omittable setter void      set (DOMString prefix, DOMString iri);
    omittable deleter void     remove (DOMString prefix);
    DOMString                  resolve (DOMString curie);
    DOMString                  shrink (DOMString iri);
    void                       setDefault (DOMString iri);
    PrefixMap                  addAll (PrefixMap prefixes, optional boolean override);
};
*/

describe('PrefixMap', function(){
	it('PrefixMap#get(string, string)', function(){
		var map = new rdf.PrefixMap;
		assert.equal(typeof map.get, 'function');
	});
	it('PrefixMap#set(string, string)', function(){
		var map = new rdf.PrefixMap;
		assert.equal(typeof map.set, 'function');
		assert.equal(typeof map.set('ex', 'http://example.com/'), 'undefined');
		assert.equal(map.resolve('ex:type'), 'http://example.com/type');
	});
	it('PrefixMap#setDefault(string)', function(){
		var map = new rdf.PrefixMap;
		assert.equal(typeof map.set, 'function');
		assert.equal(typeof map.setDefault('http://example.com/'), 'undefined');
		assert.equal(map.resolve(':type'), 'http://example.com/type');
	});
	it("PrefixMap#set negative tests", function(){
		var map = new rdf.PrefixMap;
		assert.equal(typeof map.set, 'function');
		assert.throws(function(){
			map.set('0', 'http://example.com/');
		});
		assert.throws(function(){
			map.set('::', 'http://example.com/');
		});
		assert.throws(function(){
			map.set(' ', 'http://example.com/');
		});
		assert.throws(function(){
			map.set('.', 'http://example.com/');
		});
	});
	it("PrefixMap#remove(string)", function(){
		var map = new rdf.PrefixMap;
		map.set('prefix', 'http://example.com/vocab/foo/');
		map.remove('prefix');
		assert.strictEqual(map.resolve('prefix:foo'), null);
	});
	it("PrefixMap#resolve(string)", function(){
		var map = new rdf.PrefixMap;
		map.set('ex', 'http://example.com/');
		assert.equal(typeof map.resolve, 'function');
		assert.equal(typeof map.resolve('ex:type'), 'string');
		assert.equal(map.resolve('undefinedTerm'), null);
	});
	it("PrefixMap#shrink(string)", function(){
		var map = new rdf.PrefixMap;
		map.set('ex2', 'http://example.com/vocab/foo/');
		map.set('ex', 'http://example.com/');
		map.set('exv', 'http://example.com/vocab/');
		map.set('🐉', 'http://example.com/vocab/dragon/');

		assert.equal(map.shrink('http://example.com/vocab/a'), 'exv:a');
		assert.equal(map.shrink('http://example.com/vocab/foo/b'), 'ex2:b');
		assert.equal(map.shrink('http://example.com/c'), 'ex:c');
		// File is UTF-8 (probably), but escape sequence UTF-16 surrogate pairs
		// idk I didn't invent it, man
		assert.equal(map.shrink('http://example.com/vocab/dragon/🐲'), '\uD83D\uDC09:\uD83D\uDC32');
		assert.equal(map.shrink('http://example.com/vocab/dragon/🐲🐧'), '\uD83D\uDC09:\uD83D\uDC32\uD83D\uDC27');
	});
	it("PrefixMap#addAll", function(){
		var map = new rdf.PrefixMap;
		assert.equal(typeof map.addAll, 'function');
		map.set('ex', 'http://example.com/');

		var other = new rdf.PrefixMap;
		other.set('ex', 'http://example.org/vocab/');
		other.set('fx', 'http://example.org/vocab/');

		map.addAll(other);
		assert.equal(map.resolve('ex:a'), 'http://example.com/a');
		assert.equal(map.resolve('fx:a'), 'http://example.org/vocab/a');
		assert.strictEqual(map.resolve('c:foo'), null);
	});
	it("PrefixMap#addAll (overwrite=false)", function(){
		var map = new rdf.PrefixMap;
		map.set('ex', 'http://example.com/');

		var other = new rdf.PrefixMap;
		other.set('ex', 'http://example.org/vocab/');
		other.set('fx', 'http://example.org/vocab/');

		map.addAll(other, false);
		assert.equal(map.resolve('ex:a'), 'http://example.com/a');
		assert.equal(map.resolve('fx:a'), 'http://example.org/vocab/a');
		assert.strictEqual(map.resolve('c:foo'), null);
	});
	it("PrefixMap#addAll (overwrite=true)", function(){
		var map = new rdf.PrefixMap;
		map.set('ex', 'http://example.com/');

		var other = new rdf.PrefixMap;
		other.set('ex', 'http://example.org/vocab/');
		other.set('fx', 'http://example.org/vocab/');

		map.addAll(other, true);
		assert.equal(map.resolve('ex:a'), 'http://example.org/vocab/a');
		assert.equal(map.resolve('fx:a'), 'http://example.org/vocab/a');
		assert.strictEqual(map.resolve('c:foo'), null);
	});
	it("PrefixMap#list", function(){
		var map = new rdf.PrefixMap;
		assert.equal(map.list().length, 0);
		map.set('ex', 'http://example.com/');
		var list = map.list();
		assert.equal(list.length, 1);
		assert.equal(list[0], 'ex');
	});
});
