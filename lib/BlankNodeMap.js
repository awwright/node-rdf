
"use strict";

var BlankNode = require('./RDFNode.js').BlankNode;
var Triple = require('./RDFNode.js').Triple;
var Quad = require('./RDFNode.js').Quad;

// Declare or generate a mapping of Variables or BlankNodes to BlankNodes, Terms, or Literals

module.exports.BlankNodeMap = BlankNodeMap;
function BlankNodeMap(){
	if(!(this instanceof BlankNodeMap)) return new BlankNodeMap();
	this.mapping = {};
	this.start = 0;
	this.labelPrefix = 'bn';
}

BlankNodeMap.prototype.get = function get(bnode){
	return this.mapping[bnode];
};

BlankNodeMap.prototype.process = function process(bnode){
	if(bnode instanceof Triple){
		return new Triple(this.process(bnode.subject), bnode.predicate, this.process(bnode.object));
	}
	if(bnode instanceof Quad){
		return new Quad(this.process(bnode.subject), bnode.predicate, this.process(bnode.object), bnode.graph);
	}
	if(typeof bnode=='string' && bnode.substring(0,2)!=='_:'){
		bnode = '_:' + bnode;
	}
	if(this.mapping[bnode]) return this.mapping[bnode];
	if(this.labelPrefix) this.mapping[bnode] = new BlankNode(this.labelPrefix+this.start);
	else this.mapping[bnode] = new BlankNode(bnode.toString());
	this.start++;
	return this.mapping[bnode];
};

BlankNodeMap.prototype.equals = function equals(bnode, target){
	if(this.mapping[bnode]) return this.mapping[bnode]===target;
	this.mapping[bnode] = target;
	return true;
};
