/**
 * RDF
 *
 * Implement a mash-up of the RDFa API, the RDF API, and first and foremost whatever makes sense for Node.js
 * Deviations from the standard:
 * - URI's/IRIs are always plain strings
 * - Use "predicate" not "property"
 * - Use a callback paramater and a seperate *Sync function
 * - Use a global context where it makes sense
 * - Add a function to get an RDF Collection as an Array
 */

var api = exports;


api.RDFTriple = require('./RDFNode.js').RDFTriple;

api.Graph = function(){}

api.RDFNode = require("./RDFNode.js").RDFNode;
api.BlankNode = require("./RDFNode.js").BlankNode
api.PlainLiteral = require("./RDFNode.js").PlainLiteral;
api.TypedLiteral = require("./RDFNode.js").TypedLiteral;
//api.IRI = require("./RDFNode.js").IRI;

//api.GraphLiteral = function(){}

api.DataContext = require('./DataContext.js').DataContext;
api.context = String.prototype.context = new api.DataContext;

api.DataParser = function(){}

api.DataSerializer = function(){}

api.IndexedGraph = require("./IndexedGraph.js").IndexedGraph;

api.setObjectProperties = require('./Builtins').setObjectProperties;
api.setStringProperties = require('./Builtins').setStringProperties;
api.setArrayProperties = require('./Builtins').setArrayProperties;
api.setBooleanProperties = require('./Builtins').setBooleanProperties;
api.setDateProperties = require('./Builtins').setDateProperties;
api.setNumberProperties = require('./Builtins').setNumberProperties;
api.toStruct = function(o){
	var r;
	if(typeof o=='string'||o instanceof String){
		r = new String(o);
		api.setStringProperties(r);
	}else if(o instanceof Array){
		r = new Array(o);
		api.setArrayProperties(r);
	}else if(typeof o=='boolean'||o instanceof Boolean){
		r = new Boolean(o);
		api.setBooleanProperties(r);
	}else if(o instanceof Date){
		r = new Date(o);
		api.setNumberProperties(r);
	}else if(typeof o=='number'||o instanceof Number){
		r = new Number(o);
		api.setNumberProperties(r);
	}else{
		r = new Object(o);
	}
	api.setObjectProperties(r);
	return r;
}
