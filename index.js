"use strict";

/**
 * RDF
 *
 * Implement a mash-up of the RDF Interfaces API, the RDF API, and first and foremost whatever makes sense for Node.js
 */

var api = exports;

api.Triple = require('./lib/RDFNode.js').Triple;
api.RDFNode = require("./lib/RDFNode.js").RDFNode;
api.Term = api.RDFNode;
api.NamedNode = require("./lib/RDFNode.js").NamedNode;
api.BlankNode = require("./lib/RDFNode.js").BlankNode;
api.Literal = require("./lib/RDFNode.js").Literal;

api.TriplePattern = require('./lib/RDFNode.js').TriplePattern;
api.Variable = require('./lib/RDFNode.js').Variable;

api.Profile = require('./lib/Profile.js').Profile;
api.TermMap = require('./lib/Profile.js').TermMap;
api.PrefixMap = require('./lib/Profile.js').PrefixMap;
api.RDFEnvironment = require('./lib/RDFEnvironment.js').RDFEnvironment;

api.TurtleParser = require('./lib/TurtleParser.js').Turtle;

api.Graph = require("./lib/Graph.js").Graph;
api.ResultSet = require("./lib/ResultSet.js").ResultSet;

api.environment = require('./lib/environment').environment;
api.setBuiltins = require('./lib/Builtins').setBuiltins;
api.unsetBuiltins = require('./lib/Builtins').unsetBuiltins;
api.builtins = require('./lib/Builtins');
api.parse = function(o, id){
	return api.builtins.ref.call(o, id);
}

api.ns = require('./lib/ns.js').ns;
api.rdfns = require('./lib/ns.js').rdfns;
api.rdfsns = require('./lib/ns.js').rdfsns;
api.xsdns = require('./lib/ns.js').xsdns;
