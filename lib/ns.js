"use strict";

exports.ns = function(prefix){
	if(typeof prefix!='string') throw new TypeError('Expected argument[0] `prefix` to be a string');
	return function(suffix){
		if(typeof suffix!='string') throw new TypeError('Expected argument[0] `suffix` to be a string');
		return prefix.concat(suffix);
	};
};

exports.rdfns = exports.ns('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
exports.rdfsns = exports.ns('http://www.w3.org/2000/01/rdf-schema#');
exports.xsdns = exports.ns('http://www.w3.org/2001/XMLSchema#');
