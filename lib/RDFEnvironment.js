
var IRI = require("./RDFNode.js").IRI;
var BlankNode = require("./RDFNode.js").BlankNode;
var Literal = require("./RDFNode.js").Literal;
var Triple = require("./RDFNode.js").Triple;
var IndexedGraph = require("./IndexedGraph.js").IndexedGraph;
var Profile = require("./Profile.js").Profile;
var PrefixMap = require("./Profile.js").PrefixMap;
var TermMap = require("./Profile.js").TermMap;
var loadRequiredPrefixMap = require("./Default.js").loadRequiredPrefixMap;

/**
 * Implements RDFEnvironment http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-RDFEnvironment
 */
exports.RDFEnvironment = function RDFEnvironment(){
	Profile.call(this);
	loadRequiredPrefixMap(this);
}
exports.RDFEnvironment.prototype = Object.create(Profile.prototype, {constructor:{value:exports.RDFEnvironment, iterable:false}});
exports.RDFEnvironment.prototype.createBlankNode = function(){
	return new BlankNode;
}
exports.RDFEnvironment.prototype.createNamedNode = function(v){
	return v;
}
exports.RDFEnvironment.prototype.createLiteral = function(value, language, datatype){
	var literal = new Literal(value);
	literal.language = language;
	literal.datatype = datatype;
	return literal;
}
exports.RDFEnvironment.prototype.createTriple = function(s,p,o){
	return new Triple(s,p,o);
}
exports.RDFEnvironment.prototype.createGraph = function(){
	return new IndexedGraph;
}
//exports.RDFEnvironment.prototype.createAction = function(){
//	return new Action;
//}
exports.RDFEnvironment.prototype.createProfile = function(){
	return new Profile;
}
exports.RDFEnvironment.prototype.createTermMap = function(){
	return new TermMap;
}
exports.RDFEnvironment.prototype.createPrefixMap = function(){
	return new PrefixMap;
}
