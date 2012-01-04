var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
var util=require('util');

function tl(value, type){ return value.tl(type).valueOf(); }
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
	var unit = batches['('+util.inspect(literal)+').t('+type+')'] =
		{ topic: function(){ return literal.tl(type).valueOf(); }
		};
	unit['.valueOf()==='+util.inspect(test.nativeValue)] = test;
}

addBatch("A STRING", 'xsd:string', strictCompare("A STRING"));
addBatch("true", "xsd:boolean", strictCompare(true));
addBatch("1", "xsd:boolean", strictCompare(true));
addBatch("false", "xsd:boolean", strictCompare(false));
addBatch("0", "xsd:boolean", strictCompare(false));
addBatch("0.5", "xsd:float", strictCompare(0.5));
addBatch("INF", "xsd:float", strictCompare(Number.POSITIVE_INFINITY));
addBatch("-INF", "xsd:float", strictCompare(Number.NEGATIVE_INFINITY));
addBatch("NaN", "xsd:float", NaNCompare);
addBatch("-14000", "xsd:integer", strictCompare(-14000));
addBatch("-9223372036854775808", "xsd:long", strictCompare(-9223372036854775808));
addBatch("9223372036854775807", "xsd:long", strictCompare(9223372036854775807));
addBatch("1.578125", "xsd:float", strictCompare(1.578125));
addBatch("-1.2344e56", "xsd:float", strictCompare(-1.2344e56));
addBatch("-42", "xsd:nonPositiveInteger", strictCompare(-42));
addBatch("0", "xsd:nonPositiveInteger", strictCompare(0));
addBatch("42", "xsd:nonNegativeInteger", strictCompare(42));
addBatch("0", "xsd:nonNegativeInteger", strictCompare(0));
addBatch("-42", "xsd:negativeInteger", strictCompare(-42));
addBatch("-2147483648", "xsd:long", strictCompare(-2147483648));
addBatch("2147483647", "xsd:long", strictCompare(2147483647));
addBatch("2000-01-01", "xsd:date", dateCompare(new Date('Sat, 01 Jan 2000 00:00:00 GMT')));
//addBatch("21:32:52", "xsd:time", dateCompare(new Date('Sat, 01 Jan 2000 00:00:00 GMT'))); // There's no good way to represent just time-of-day... Ignore this guy?
addBatch("2001-10-26T21:32:52.12679", "xsd:dateTime", dateCompare(new Date('2001-10-26T21:32:52.12679'))); // FIXME of course this is going to pass

vows.describe('rdf.context.convert').addBatch(batches).export(module);
