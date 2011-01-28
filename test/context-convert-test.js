var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

function tl(value, type){ return value.tl(type); }

vows.describe('rdf.context').addBatch(
{ 'convertType xsd:string "A STRING"':
	{ topic: function(){ return rdf.context.convertType(tl("A STRING", "xsd:string".resolve())); }
	, "==='A STRING'": function(t){ assert.strictEqual(t, "A STRING"); }
	}

, 'convertType xsd:boolean "true"':
	{ topic: function(){ return rdf.context.convertType(tl("true", "xsd:boolean")); }
	, "===true": function(t){ assert.strictEqual(t, true); }
	}
, 'convertType xsd:boolean "1"':
	{ topic: function(){ return rdf.context.convertType(tl("1", "xsd:boolean")); }
	, "===true": function(t){ assert.strictEqual(t, true); }
	}
, 'convertType xsd:boolean "false"':
	{ topic: function(){ return rdf.context.convertType(tl("false", "xsd:boolean")); }
	, "===false": function(t){ assert.strictEqual(t, false); }
	}

, 'convertType xsd:boolean "0"':
	{ topic: function(){ return rdf.context.convertType(tl("0", "xsd:boolean")); }
	, "===false": function(t){ assert.strictEqual(t, false); }
	}
, 'convertType xsd:float "0.5"':
	{ topic: function(){ return rdf.context.convertType(tl("0.5", "xsd:float")); }
	, "===0.5": function(t){ assert.strictEqual(t, 0.5); }
	}
, 'convertType xsd:float "INF"':
	{ topic: function(){ return rdf.context.convertType(tl("INF", "xsd:float")); }
	, "===Number.POSITIVE_INFINITY": function(t){ assert.strictEqual(t, Number.POSITIVE_INFINITY); }
	}
, 'convertType xsd:float "-INF"':
	{ topic: function(){ return rdf.context.convertType(tl("-INF", "xsd:float")); }
	, "===Number.NEGATIVE_INFINITY": function(t){ assert.strictEqual(t, Number.NEGATIVE_INFINITY); }
	}
, 'convertType xsd:float "NaN"':
	{ topic: function(){ return rdf.context.convertType(tl("NaN", "xsd:float")); }
	, "===Number.NaN": function(t){ assert.isNaN(t); }
	}
, 'convertType xsd:integer "-14000"':
	{ topic: function(){ return rdf.context.convertType(tl("-14000", "xsd:integer")); }
	, "===-14000": function(t){ assert.equal(t, -14000); }
	}
, 'convertType xsd:long "-9223372036854775808"':
	{ topic: function(){ return rdf.context.convertType(tl("-9223372036854775808", "xsd:long")); }
	, "===-9223372036854775808": function(t){ assert.equal(t, -9223372036854775808); }
	}
, 'convertType xsd:long "9223372036854775807"':
	{ topic: function(){ return rdf.context.convertType(tl("9223372036854775807", "xsd:long")); }
	, "===9223372036854775807": function(t){ assert.equal(t, 9223372036854775807); }
	}
, 'convertType xsd:double "1.578125"':
	{ topic: function(){ return rdf.context.convertType(tl("1.578125", "xsd:double")); }
	, "===1.578125": function(t){ assert.equal(t, 1.578125); }
	}
, 'convertType xsd:nonPositiveInteger "-42"':
	{ topic: function(){ return rdf.context.convertType(tl("-42", "xsd:nonPositiveInteger")); }
	, "===-42": function(t){ assert.equal(t, -42); }
	}
, 'convertType xsd:nonPositiveInteger "0"':
	{ topic: function(){ return rdf.context.convertType(tl("0", "xsd:nonPositiveInteger")); }
	, "===0": function(t){ assert.strictEqual(t, 0); }
	}
, 'convertType xsd:nonNegativeInteger "42"':
	{ topic: function(){ return rdf.context.convertType(tl("42", "xsd:nonNegativeInteger")); }
	, "===42": function(t){ assert.equal(t, 42); }
	}
, 'convertType xsd:nonNegativeInteger "0"':
	{ topic: function(){ return rdf.context.convertType(tl("0", "xsd:nonNegativeInteger")); }
	, "===0": function(t){ assert.strictEqual(t, 0); }
	}
, 'convertType xsd:negativeInteger "-42"':
	{ topic: function(){ return rdf.context.convertType(tl("-42", "xsd:negativeInteger")); }
	, "===-42": function(t){ assert.strictEqual(t, -42); }
	}
, 'convertType xsd:long "-2147483648"':
	{ topic: function(){ return rdf.context.convertType(tl("-2147483648", "xsd:long")); }
	, "===-2147483648": function(t){ assert.equal(t, -2147483648); }
	}
, 'convertType xsd:long "2147483647"':
	{ topic: function(){ return rdf.context.convertType(tl("2147483647", "xsd:long")); }
	, "===2147483647": function(t){ assert.equal(t, 2147483647); }
	}

, 'convertType xsd:date "2000-01-01"':
	{ topic: function(){ return rdf.context.convertType(tl("2000-01-01", "xsd:date")); }
	, "===2147483647": function(t){ assert.equal(t, 2147483647); }
	}
, 'convertType xsd:time "2000-01-01"':
	{ topic: function(){ return rdf.context.convertType(tl("2000-01-01", "xsd:date")); }
	, "===2147483647": function(t){ assert.equal(t, 2147483647); }
	}
, 'convertType xsd:dateTime "2000-01-01"':
	{ topic: function(){ return rdf.context.convertType(tl("2000-01-01", "xsd:date")); }
	, "===2147483647": function(t){ assert.equal(t, 2147483647); }
	}


}).export(module);
