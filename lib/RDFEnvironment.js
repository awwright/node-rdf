"use strict";

var NamedNode = require("./RDFNode.js").NamedNode;
var BlankNode = require("./RDFNode.js").BlankNode;
var Literal = require("./RDFNode.js").Literal;
var Triple = require("./RDFNode.js").Triple;
var Graph = require("./Graph.js").Graph;
var Profile = require("./Profile.js").Profile;
var PrefixMap = require("./Profile.js").PrefixMap;
var TermMap = require("./Profile.js").TermMap;
var loadRequiredPrefixMap = require("./prefixes.js").loadRequiredPrefixMap;

/**
 * Implements RDFEnvironment http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-RDFEnvironment
 */
exports.RDFEnvironment = function RDFEnvironment(){
	Profile.call(this);
	loadRequiredPrefixMap(this);
};
exports.RDFEnvironment.prototype = Object.create(Profile.prototype, {constructor:{value:exports.RDFEnvironment, iterable:false}});
exports.RDFEnvironment.prototype.createBlankNode = function(){
	return new BlankNode;
};
exports.RDFEnvironment.prototype.createNamedNode = function(v){
	return new NamedNode(v);
};
exports.RDFEnvironment.prototype.createLiteral = function(value, datatype, _dt){
	if(typeof value!='string') throw new Error('Expected argument[0] `value` to be a string');
	if(datatype!==undefined && datatype!==null && typeof datatype!=='string' && !(datatype instanceof NamedNode)) throw new TypeError('Expected optional argument[1] `datatype` to be a string');
	if(_dt!==undefined && _dt!==null && typeof _dt!=='string' && !(_dt instanceof NamedNode)) throw new TypeError('Expected optional argument[2] `_dt` to be a string');
	if(datatype instanceof NamedNode){
		return new Literal(value, datatype);
	}else if(typeof datatype=='string' && (_dt==null || _dt==undefined || _dt=='http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')){
		// Process arguments as a typed and/or language literal
		return new Literal(value, datatype);
	}else if((datatype==null || datatype==undefined) && _dt){
		// Process arguments as a typed literal
		return Literal.typed(value, _dt);
	}
	return new Literal(value);
};
exports.RDFEnvironment.prototype.createTypedLiteral = function(value, datatype){
	return Literal.typed(value, datatype);
};
exports.RDFEnvironment.prototype.createLanguageLiteral = function(value, language){
	return Literal.language(value, language);
};
exports.RDFEnvironment.prototype.createTriple = function(s,p,o){
	return new Triple(s,p,o);
};
exports.RDFEnvironment.prototype.createGraph = function(g){
	return new Graph(g);
};
//exports.RDFEnvironment.prototype.createAction = function(){
//	return new Action;
//}
exports.RDFEnvironment.prototype.createProfile = function(){
	return new Profile;
};
exports.RDFEnvironment.prototype.createTermMap = function(){
	return new TermMap;
};
exports.RDFEnvironment.prototype.createPrefixMap = function(){
	return new PrefixMap;
};
