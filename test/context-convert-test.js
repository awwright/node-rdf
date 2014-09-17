var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
var rdfenv=rdf.environment;
var util=require('util');

var batches = {};

function strictCompare(nv){
	var test = function(t){ assert.strictEqual(t, nv); };
	test.nativeValue = nv;
	return test;
}

function dateCompare(nv){
	var test = function(t){ assert.instanceOf(t, Date); assert.strictEqual(t.getTime(), nv.getTime()); };
	test.nativeValue = nv;
	return test;
}

function NaNCompare(t){ assert.isNaN(t); }
NaNCompare.nativeValue = Number.NaN;

function addBatch(literal, type, test){
	// Literal must be a string
	var unit = batches['('+util.inspect(literal)+').t(xsd:'+type+')'] =
		{ topic: function(){ return rdfenv.createLiteral(literal, null, rdf.xsdns(type)).valueOf(); }
		};
	unit['.valueOf()==='+util.inspect(test.nativeValue)] = test;
}

addBatch("A STRING", 'string', strictCompare("A STRING"));
addBatch("true", "boolean", strictCompare(true));
addBatch("1", "boolean", strictCompare(true));
addBatch("false", "boolean", strictCompare(false));
addBatch("0", "boolean", strictCompare(false));
addBatch("0.5", "float", strictCompare(0.5));
addBatch("INF", "float", strictCompare(Number.POSITIVE_INFINITY));
addBatch("-INF", "float", strictCompare(Number.NEGATIVE_INFINITY));
addBatch("NaN", "float", NaNCompare);
addBatch("-14000", "integer", strictCompare(-14000));
addBatch("-9223372036854775808", "long", strictCompare(-9223372036854775808));
addBatch("9223372036854775807", "long", strictCompare(9223372036854775807));
addBatch("1.578125", "float", strictCompare(1.578125));
addBatch("-1.2344e56", "float", strictCompare(-1.2344e56));
addBatch("-42", "nonPositiveInteger", strictCompare(-42));
addBatch("0", "nonPositiveInteger", strictCompare(0));
addBatch("42", "nonNegativeInteger", strictCompare(42));
addBatch("0", "nonNegativeInteger", strictCompare(0));
addBatch("-42", "negativeInteger", strictCompare(-42));
addBatch("-2147483648", "long", strictCompare(-2147483648));
addBatch("2147483647", "long", strictCompare(2147483647));
addBatch("2000-01-01", "date", dateCompare(new Date('Sat, 01 Jan 2000 00:00:00 GMT')));
//addBatch("21:32:52", "time", dateCompare(new Date('Sat, 01 Jan 2000 00:00:00 GMT'))); // There's no good way to represent just time-of-day... Ignore this guy?
addBatch("2001-10-26T21:32:52.12679", "dateTime", dateCompare(new Date('2001-10-26T21:32:52.12679'))); // FIXME of course this is going to pass

vows.describe('rdf.context.convert').addBatch(batches).export(module);
