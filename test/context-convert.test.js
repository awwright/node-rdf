var assert = require('assert');
var rdf = require('..');
var rdfenv = rdf.environment;
var util = require('util');

function addBatch(literal, type, test){
	// Literal must be a string
	it('('+util.inspect(literal)+').t(xsd:'+type+')', function(){
		var value = rdfenv.createLiteral(literal, null, rdf.xsdns(type)).valueOf();
		if(type=='date' || type=='dateTime'){
			assert.ok(value instanceof Date);
			assert.strictEqual(value.getTime(), test.getTime());
		}else if(Number.isNaN(test)){
			assert.ok(Number.isNaN(value));
		}else{
			assert.strictEqual(value, test);
		}
	});
}

describe('rdf.context.convert', function(){
	addBatch("A STRING", 'string', "A STRING");
	addBatch("true", "boolean", true);
	addBatch("1", "boolean", true);
	addBatch("false", "boolean", false);
	addBatch("0", "boolean", false);
	addBatch("0.5", "float", 0.5);
	addBatch("INF", "float", Number.POSITIVE_INFINITY);
	addBatch("-INF", "float", Number.NEGATIVE_INFINITY);
	addBatch("NaN", "float", 0/0);
	addBatch("-14000", "integer", -14000);
	addBatch("-9223372036854775808", "long", -9223372036854775808);
	addBatch("9223372036854775807", "long", 9223372036854775807);
	addBatch("1.578125", "float", 1.578125);
	addBatch("-1.2344e56", "float", -1.2344e56);
	addBatch("-42", "nonPositiveInteger", -42);
	addBatch("0", "nonPositiveInteger", 0);
	addBatch("42", "nonNegativeInteger", 42);
	addBatch("0", "nonNegativeInteger", 0);
	addBatch("-42", "negativeInteger", -42);
	addBatch("-2147483648", "long", -2147483648);
	addBatch("2147483647", "long", 2147483647);
	addBatch("2000-01-01", "date", new Date('Sat, 01 Jan 2000 00:00:00 GMT'));
	//addBatch("21:32:52", "time", new Date('Sat, 01 Jan 2000 00:00:00 GMT')); // There's no good way to represent just time-of-day... Ignore this guy?
	addBatch("2001-10-26T21:32:52.12679", "dateTime", new Date('2001-10-26T21:32:52.12679'));
	// TODO probbly should verify the inputs are of the correct range?
});
