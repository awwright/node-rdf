var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

vows.describe('rdf.environment.resolve').addBatch( // The builtin RDFEnvironment
{ "rdf.environment":
	{ topic: rdf.environment
	, ".resolve(rdf:type)":
		{ topic: function(t){ return t.resolve("rdf:type"); }
		, "Equals <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>": function(t){ assert.strictEqual(t, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"); }
		}
	, ".resolve(rdfs:Class)":
		{ topic: function(t){ return t.resolve("rdfs:Class"); }
		, "Equals <http://www.w3.org/2000/01/rdf-schema#Class>": function(t){ assert.strictEqual(t, "http://www.w3.org/2000/01/rdf-schema#Class"); }
		}
	, ".resolve(unkfoo:suffix)":
		{ topic: function(t){ return t.resolve("unkfoo:suffix"); }
		, "is null": function(t){ assert.isNull(t); }
		, " rdf.environment.setPrefix(...)":
			{ topic: function(s, t){ t.setPrefix("unkfoo", "http://example.com/defined/"); return t; }
			, "rdf.environment.resolve(unkfoo:suffix)":
				{ topic: function(r, s, t){ return t.resolve("unkfoo:suffix"); }
				, "Equals <http://example.com/defined/suffix>": function(t){ assert.strictEqual(t, "http://example.com/defined/suffix"); }
				}
			, "rdf.environment.resolve(UNKfoo:suffix)":
				{ topic: function(r, s, t){ return t.resolve("UNKfoo:suffix"); }
				, "is null": function(t){ assert.isNull(t); }
				}
			}
		}
	}
}).addBatch( // This batch with new RDFEnvironment to be run after the previous one finishes
{ "env2":
	{ topic: new rdf.RDFEnvironment
	, ".resolve(rdf:type)":
		{ topic: function(t){ return t.resolve("rdf:type"); }
		, "Equals <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>": function(t){ assert.strictEqual(t, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"); }
		}
	, ".resolve(rdfs:Class)":
		{ topic: function(t){ return t.resolve("rdfs:Class"); }
		, "Equals <http://www.w3.org/2000/01/rdf-schema#Class>": function(t){ assert.strictEqual(t, "http://www.w3.org/2000/01/rdf-schema#Class"); }
		}
	, ".resolve(unkfoo:suffix)":
		{ topic: function(t){ return t.resolve("unkfoo:suffix"); }
		, "is null": function(t){ assert.isNull(t); }
		, "rdf.environment.setPrefix(...)":
			{ topic: function(s, t){ t.setPrefix("unkfoo", "http://example.com/defined2/"); return t; }
			, "rdf.environment.resolve(unkfoo:suffix)":
				{ topic: function(r, s, t){ return t.resolve("unkfoo:suffix"); }
				, "Equals <http://example.com/defined2/suffix>": function(t){ assert.strictEqual(t, "http://example.com/defined2/suffix"); }
				}
			, "rdf.environment.resolve(UNKfoo:suffix)":
				{ topic: function(r, s, t){ return t.resolve("UNKfoo:suffix"); }
				, "is null": function(t){ assert.isNull(t); }
				}
			}
		}
	}
}).addBatch( // This tests a new Profile from the builtin enviornment.createProfile
{ "profile3":
	{ topic: rdf.environment.createProfile()
	, ".resolve(unkfoo:suffix)":
		{ topic: function(t){ return t.resolve("unkfoo:suffix"); }
		, "is null": function(t){ assert.isNull(t); }
		, "rdf.environment.setPrefix(...)":
			{ topic: function(s, t){ t.setPrefix("unkfoo", "http://example.com/defined3/"); return t; }
			, "rdf.environment.resolve(unkfoo:suffix)":
				{ topic: function(r, s, t){ return t.resolve("unkfoo:suffix"); }
				, "Equals <http://example.com/defined3/suffix>": function(t){ assert.strictEqual(t, "http://example.com/defined3/suffix"); }
				}
			, "rdf.environment.resolve(UNKfoo:suffix)":
				{ topic: function(r, s, t){ return t.resolve("UNKfoo:suffix"); }
				, "is null": function(t){ assert.isNull(t); }
				}
			}
		}
	}
}).export(module);
