var assert = require('assert');
var rdf = require('..');

function BlankNodeMapTests(){
	it("instance", function(){
		var bn = rdf.BlankNodeMap();
		assert(bn instanceof rdf.BlankNodeMap);
	});
}

describe('BlankNodeMap', BlankNodeMapTests);

describe('BlankNodeMap (with builtins)', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});
	BlankNodeMapTests();
});
