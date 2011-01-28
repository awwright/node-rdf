var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

vows.describe('Turtle parsing').addBatch(
{ "URI triple statement":
	{ topic: ""
	, "Subject matches": function(t){}
	, "Predicate matches": function(t){}
	, "Object matches": function(t){}
	}
, "String literal statement":
	{ topic: ""
	, "Subject matches": function(t){}
	, "Predicate matches": function(t){}
	, "Object matches": function(t){}
	}
, "Typed literal statement":
	{ topic: ""
	, "Subject matches": function(t){}
	, "Predicate matches": function(t){}
	, "Object matches": function(t){}
	}
, "RDF Collections":
	{ topic: ""
	, "Subject matches": function(t){}
	, "Predicate matches": function(t){}
	, "Object matches": function(t){}
	}
, "Blank Nodes square brackets":
	{ topic: ""
	, "Subject matches": function(t){}
	, "Predicate matches": function(t){}
	, "Object matches": function(t){}
	}
, "Blank Nodes underscore syntax":
	{ topic: ""
	, "Subject matches": function(t){}
	, "Predicate matches": function(t){}
	, "Object matches": function(t){}
	}
}).export(module);
