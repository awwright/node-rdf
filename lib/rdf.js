/**
 * RDF
 *
 * Implement a mash-up of the RDF Interfaces API, the RDF API, and first and foremost whatever makes sense for Node.js
 * Deviations from the standard:
 * - URI's/IRIs are always plain strings
 * - Use a callback parameter and a seperate *Sync function
 * - Use a global context where it makes sense
 */

var api = exports;

api.Triple = require('./RDFNode.js').Triple;
api.RDFNode = require("./RDFNode.js").RDFNode;
api.BlankNode = require("./RDFNode.js").BlankNode;
api.Literal = require("./RDFNode.js").Literal;
api.IRI = require("./RDFNode.js").IRI;

api.Profile = require('./Profile.js').Profile;
api.RDFEnvironment = require('./RDFEnvironment.js').RDFEnvironment;

api.TurtleParser = require('./TurtleParser.js').Turtle;

api.DataSerializer = function(){}

api.IndexedGraph = require("./IndexedGraph.js").IndexedGraph;
api.TripletGraph = require("./TripletGraph.js").TripletGraph;

api.setObjectProperties = require('./Builtins').setObjectProperties;
api.setStringProperties = require('./Builtins').setStringProperties;
api.setArrayProperties = require('./Builtins').setArrayProperties;
api.setBooleanProperties = require('./Builtins').setBooleanProperties;
api.setDateProperties = require('./Builtins').setDateProperties;
api.setNumberProperties = require('./Builtins').setNumberProperties;
api.environment = require('./Builtins').environment;
api.setBuiltins = require('./Builtins').setBuiltins;
api.ref = require('./Builtins').ref;
api.parse = function(o, id){
	return api.ref.call(o, id);
}

api.ns = function(ns){
	return function(v){return ns+v;};
}
api.rdfns = api.ns('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
api.rdfsns = api.ns('http://www.w3.org/2000/01/rdf-schema#');
api.xsdns = api.ns('http://www.w3.org/2001/XMLSchema#');
