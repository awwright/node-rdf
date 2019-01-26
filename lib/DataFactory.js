// RDF Representation - DataFactory support

"use strict";

var RDFNode = require('./RDFNode.js');
var defaultDefaultGraph = new RDFNode.DefaultGraph();

exports.namedNode = RDFNode.NamedNode;
exports.blankNode = RDFNode.BlankNode;
exports.literal = RDFNode.Literal;
exports.variable = RDFNode.Variable;
exports.defaultGraph = function(){
	return defaultDefaultGraph;
};
exports.triple = RDFNode.Triple;
exports.quad = RDFNode.Quad;
