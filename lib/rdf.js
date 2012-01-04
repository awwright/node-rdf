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


api.Triple = require('./RDFNode.js').Triple;

api.Graph = function(){}

api.RDFNode = require("./RDFNode.js").RDFNode;
api.BlankNode = require("./RDFNode.js").BlankNode
api.Literal = require("./RDFNode.js").PlainLiteral;
api.IRI = require("./RDFNode.js").IRI;

//api.GraphLiteral = function(){}

api.Profile = require('./Profile.js').Profile;
api.RDFEnvironment = require('./RDFEnvironment.js').RDFEnvironment;

api.DataParser = function(){}

api.DataSerializer = function(){}

api.IndexedGraph = require("./IndexedGraph.js").IndexedGraph;

api.setObjectProperties = require('./Builtins').setObjectProperties;
api.setStringProperties = require('./Builtins').setStringProperties;
api.setArrayProperties = require('./Builtins').setArrayProperties;
api.setBooleanProperties = require('./Builtins').setBooleanProperties;
api.setDateProperties = require('./Builtins').setDateProperties;
api.setNumberProperties = require('./Builtins').setNumberProperties;
api.environment = require('./Builtins').environment;
