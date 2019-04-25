// RDF Representation - DataFactory support

"use strict";

var RDFNode = require('./RDFNode.js');
var Dataset = require('./Dataset.js').Dataset;

module.exports.DataFactory = DataFactory;
function DataFactory(){
	// At a future date, have rdf.Environment use DataFactory for its Environment#createFoo methods
	// this.blankNodeId = 0;
	// this.blankNodeMap = {};
	this.DefaultGraphInstance = new RDFNode.DefaultGraph();
}

DataFactory.prototype.namedNode = function namedNode(uri){
	return new RDFNode.NamedNode(uri);
};
DataFactory.prototype.blankNode = function blankNode(label){
	// If a label is specified, possibly re-use an existing blankNode
	return new RDFNode.BlankNode(label);
};
DataFactory.prototype.literal = function literal(value, dt){
	return new RDFNode.Literal(value, dt);
};
DataFactory.prototype.variable = function variable(name){
	return new RDFNode.Variable(name);
};
DataFactory.prototype.defaultGraph = function defaultGraph(){
	return this.DefaultGraphInstance;
};
DataFactory.prototype.triple = function triple(subject, predicate, object){
	return new RDFNode.Triple(subject, predicate, object);
};
DataFactory.prototype.quad = function quad(subject, predicate, object, graph){
	return new RDFNode.Quad(subject, predicate, object, graph || this.DefaultGraphInstance);
};
DataFactory.prototype.dataset = function dataset(src){
	return new Dataset(src);
};
DataFactory.prototype.fromTerm = function fromTerm(node){
	if(typeof node!=='object') throw new Error('Expected an object `node`');
	if(node instanceof RDFNode.RDFNode) return node;
	switch(node.termType){
		case 'NamedNode': return new RDFNode.NamedNode(node.value);
		case 'BlankNode': return new RDFNode.BlankNode(node.value);
		case 'Literal': return new RDFNode.Literal(node.value, node.language ? node.language : this.fromTerm(node.datatype)); // FIXME
		case 'Variable': return new RDFNode.Variable(node.value);
		case 'DefaultGraph': return this.DefaultGraphInstance;
	}
	throw new Error('Unrecognised Term#termType');
};
DataFactory.prototype.fromQuad = function fromQuad(quad){
	if(typeof quad!=='object') throw new Error('Expected an object `quad`');
	if(quad instanceof RDFNode.Quad) return quad;
	return new RDFNode.Quad(this.fromTerm(quad.subject), this.fromTerm(quad.predicate), this.fromTerm(quad.object), this.fromTerm(quad.graph));
};
DataFactory.prototype.fromTriple = function fromTriple(stmt){
	if(typeof stmt!=='object') throw new Error('Expected an object `quad`');
	if(stmt instanceof RDFNode.Triple) return stmt;
	return new RDFNode.Triple(this.fromTerm(stmt.subject), this.fromTerm(stmt.predicate), this.fromTerm(stmt.object));
};
