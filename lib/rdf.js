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

require('./Builtins.js');

