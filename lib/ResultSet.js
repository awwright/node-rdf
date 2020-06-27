"use strict";

var Graph = require('./Graph.js');
var RDFNode = require('./RDFNode.js');

module.exports.ResultSet = ResultSet;
function ResultSet(graph, initialNode){
	if(typeof initialNode=='string') initialNode = new RDFNode.NamedNode(initialNode);
	if(!(graph instanceof Graph.Graph)) throw new TypeError('Expected argument[0] `graph` to be a Graph');
	this.graph = graph;
	this.set = [];
	if(initialNode){
		if(!RDFNode.RDFNode.is(initialNode)) throw new Error('Triple initialNode is not an RDFNode');
		if(initialNode.termType!=='NamedNode' && initialNode.termType!=='BlankNode') throw new Error('subject must be a NamedNode/BlankNode');
		this.set.push(initialNode);
	}
}

ResultSet.prototype.set = [];

ResultSet.prototype.add = function(node){
	// @@@TODO maybe verify that `node` is somewhere in the graph
	if(this.set.some(function(v){ return v.equals(node); })) return;
	this.set.push(node);
};

ResultSet.prototype.rel = function(predicate){
	if(typeof predicate=='string') predicate = new RDFNode.NamedNode(predicate);
	if(!RDFNode.RDFNode.is(predicate)) throw new Error('Expected argument[0] `predicate` to be an RDFNode');
	if(predicate.termType!=='NamedNode') throw new Error('Expected argument[0] `predicate` to be a NamedNode');
	var graph = this.graph;
	var set = this.set;
	var result = new ResultSet(graph);
	set.forEach(function(node){
		if(node.termType!='NamedNode' && node.termType!='BlankNode') return;
		graph.match(node, predicate, null).forEach(function(triple){
			result.add(triple.object);
		});
	});
	return result;
};

ResultSet.prototype.rev = function rev(predicate){
	if(typeof predicate=='string') predicate = new RDFNode.NamedNode(predicate);
	if(!RDFNode.RDFNode.is(predicate)) throw new Error('Expected argument[0] `predicate` to be an RDFNode');
	if(predicate.termType!=='NamedNode') throw new Error('Expected argument[0] `predicate` to be a NamedNode');
	var graph = this.graph;
	var set = this.set;
	var result = new ResultSet(graph);
	set.forEach(function(node){
		graph.match(null, predicate, node).forEach(function(triple){
			result.add(triple.subject);
		});
	});
	return result;
};

ResultSet.prototype.toArray = function toArray(callback){
	return this.set.slice();
};

ResultSet.prototype.some = function some(callback){
	return this.set.some(callback);
};

ResultSet.prototype.every = function every(callback){
	return this.set.every(callback);
};

ResultSet.prototype.filter = function filter(callback){
	var result = new ResultSet(this.graph);
	// FIXME this can probably be optimized since we're only removing nodes
	this.set.filter(callback).forEach(function(node){
		result.add(node);
	});
	return result;
};

ResultSet.prototype.forEach = function forEach(callback){
	return this.set.forEach(callback);
};

ResultSet.prototype.map = function map(callback){
	var result = new ResultSet(this.graph);
	this.set.map(callback).forEach(function(node){
		result.add(node);
	});
	return result;
};

ResultSet.prototype.reduce = function reduce(callback, initial){
	return this.set.reduce(callback, initial);
};

ResultSet.prototype.one = function one(callback){
	if(this.set.length>1) throw new Error('Expected one match');
	if(this.set.length===0) return null;
	return this.set[0];
};

Object.defineProperty(ResultSet.prototype, 'length', { get: function(){ return this.set.length; } });
