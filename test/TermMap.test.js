
var assert = require('assert');
var rdf = require('..');

/*
[NoInterfaceObject]
interface TermMap {
    omittable getter DOMString get (DOMString term);
    omittable setter void      set (DOMString term, DOMString iri);
    omittable deleter void     remove (DOMString term);
    DOMString                  resolve (DOMString term);
    DOMString                  shrink (DOMString iri);
    void                       setDefault (DOMString iri);
    TermMap                    addAll (TermMap terms, optional boolean override); // Corrected typo
};
*/

describe('TermMap', function(){
	it('TermMap#get(string, string)', function(){
		var map = new rdf.TermMap;
		assert.equal(typeof map.get, 'function');
	});
	it('TermMap#set(string, string)', function(){
		var map = new rdf.TermMap;
		assert.equal(typeof map.set, 'function');
		assert.equal(typeof map.set('type', 'http://example.com/type'), 'undefined');
		assert.equal(map.get('type'), 'http://example.com/type');
		assert.equal(map.resolve('type'), 'http://example.com/type');
	});
	it('TermMap#setDefault(string)', function(){
		var map = new rdf.TermMap;
		assert.equal(typeof map.set, 'function');
		assert.equal(typeof map.setDefault('http://example.com/'), 'undefined');
		assert.equal(map.resolve('type'), 'http://example.com/type');
	});
	it("TermMap#set negative tests", function(){
		var map = new rdf.TermMap;
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
	it("TermMap#remove(string)", function(){
		var map = new rdf.TermMap;
		map.set('foo', 'http://example.com/vocab/foo/');
		map.remove('foo');
		assert.strictEqual(map.resolve('foo'), null);
	});
	it("TermMap#resolve(string)", function(){
		var map = new rdf.TermMap;
		map.set('type', 'http://example.com/');
		assert.equal(typeof map.resolve, 'function');
		assert.equal(typeof map.resolve('type'), 'string');
		assert.equal(map.resolve('undefinedTerm'), null);
	});
	it("TermMap#shrink(string)", function(){
		var map = new rdf.TermMap;
		map.set('ex', 'http://example.com/ex');
		map.setDefault('http://example.com/vocab/🐉/');

		assert.equal(map.shrink('http://example.com/ex'), 'ex');
		// File is UTF-8 (probably), but escape sequence UTF-16 surrogate pairs
		// idk I didn't invent it, man
		assert.equal(map.shrink('http://example.com/vocab/🐉/🐲'), '\uD83D\uDC32');
	});
	it("addAll", function(){
		var map = new rdf.TermMap;
		assert.equal(typeof map.addAll, 'function');
		map.set('a', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

		var other = new rdf.TermMap;
		other.set('a', 'http://example.org/type');
		other.set('b', 'http://example.org/type');

		map.addAll(other);
		assert.equal(map.resolve('a'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
		assert.equal(map.resolve('b'), 'http://example.org/type');
		assert.strictEqual(map.resolve('term'), null);
	});
	it("addAll (overwrite=false)", function(){
		var map = new rdf.TermMap;
		map.set('a', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

		var other = new rdf.TermMap;
		other.set('a', 'http://example.org/type');
		other.set('b', 'http://example.org/type');

		map.addAll(other, false);
		assert.equal(map.resolve('a'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
		assert.equal(map.resolve('b'), 'http://example.org/type');
		assert.strictEqual(map.resolve('term'), null);
	});
	it("addAll (overwrite=true)", function(){
		var map = new rdf.TermMap;
		map.set('a', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

		var other = new rdf.TermMap;
		other.set('a', 'http://example.org/type');
		other.set('b', 'http://example.org/type');

		map.addAll(other, true);
		assert.equal(map.resolve('a'), 'http://example.org/type');
		assert.equal(map.resolve('b'), 'http://example.org/type');
		assert.strictEqual(map.resolve('term'), null);
	});
	it("TermMap#list", function(){
		var map = new rdf.TermMap;
		assert.equal(map.list().length, 0);
		map.set('ex', 'http://example.com/');
		var list = map.list();
		assert.equal(list.length, 1);
		assert.equal(list[0], 'ex');
	});
});
