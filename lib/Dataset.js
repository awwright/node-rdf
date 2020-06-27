"use strict";

var RDFNode = require('./RDFNode.js');
var Graph = require('./Graph.js').Graph;

/**
 * Read an RDF Collection and return it as an Array
 */
var rdfnil = new RDFNode.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil');
var rdffirst = new RDFNode.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first');
var rdfrest = new RDFNode.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest');

function isIndex(i, a, b, c, d, t){
	if(!i[a]) return false;
	if(!i[a][b]) return false;
	if(!i[a][b][c]) return false;
	return i[a][b][c][d] ? i[a][b][c][d].equals(t) : false ;
}

function insertIndex(i, a, b, c, d, t){
	if(!i[a]) i[a] = {};
	if(!i[a][b]) i[a][b] = {};
	if(!i[a][b][c]) i[a][b][c] = {};
	i[a][b][c][d] = t;
}

function deleteIndex(i, a, b, c, d, t){
	if(i[a] && i[a][b] && i[a][b][c] && i[a][b][c][d]){
		if(!i[a][b][c][d].equals(t)) throw new Error('assertion fail: deleted quad mismatch');
		delete(i[a][b][c][d]);
		if(!Object.keys(i[a][b][c]).length) delete(i[a][b][c]);
		if(!Object.keys(i[a][b]).length) delete(i[a][b]);
		if(!Object.keys(i[a]).length) delete(i[a]);
	}
}

exports.Dataset = Dataset;
function Dataset(init){
	this.clear();
	//this._actions = [];
	Object.defineProperty(this, 'size', {get: function(){return self.length;}});
	var self = this;
	if(init && init.forEach){
		init.forEach(function(t){ self.add(t); });
	}
}
Dataset.prototype.length = null;
Dataset.prototype.graph = null;

// TODO remove this? What is this doing?
Dataset.prototype.importArray = function(a) { while( a.length > 0) { this.add(a.pop()); } };

Dataset.prototype.insertIndex = insertIndex;
Dataset.prototype.deleteIndex = deleteIndex;
Dataset.prototype.add = function(quad) {
	if(!(quad instanceof RDFNode.Quad)) throw new TypeError('Expected a Quad for argument[0] `quad`');
	var st=quad.subject.toNT(), pt=quad.predicate.toNT(), ot=quad.object.toNT(), gt=quad.graph.toNT();
	if(isIndex(this.indexSPOG, st, pt, ot, gt, quad)) return;
	insertIndex(this.indexSPOG, st, pt, ot, gt, quad);
	insertIndex(this.indexPOGS, pt, ot, gt, st, quad);
	insertIndex(this.indexOGSP, ot, gt, st, pt, quad);
	insertIndex(this.indexGSPO, gt, st, pt, ot, quad);
	insertIndex(this.indexGPOS, gt, pt, ot, st, quad);
	insertIndex(this.indexOSGP, ot, st, gt, pt, quad);
	this.length++;
	//this.actions.forEach(function(fn){ fn(quad); });
};
Dataset.prototype.addAll = function(g){
	var g2 = this;
	g.forEach(function(s){ g2.add(s); });
};
Dataset.prototype.union = function union(){
	var gx = new Graph;
	this.forEach(function(q){
		gx.add(new RDFNode.Triple(q.subject, q.predicate, q.object));
	});
	return gx;
};
Dataset.prototype.remove = function(quad) {
	var st=quad.subject.toNT(), pt=quad.predicate.toNT(), ot=quad.object.toNT(), gt=quad.graph.toNT();
	if(!isIndex(this.indexSPOG, st, pt, ot, gt, quad)) return;
	deleteIndex(this.indexSPOG, st, pt, ot, gt, quad);
	deleteIndex(this.indexPOGS, pt, ot, gt, st, quad);
	deleteIndex(this.indexOGSP, ot, gt, st, pt, quad);
	deleteIndex(this.indexGSPO, gt, st, pt, ot, quad);
	deleteIndex(this.indexGPOS, gt, pt, ot, st, quad);
	deleteIndex(this.indexOSGP, ot, st, gt, pt, quad);
	this.length--;
};
Dataset.prototype.delete = Dataset.prototype.remove;
Dataset.prototype.has = function(quad) {
	if(!(quad instanceof RDFNode.Quad)) throw new TypeError('Expected a Quad for argument[0] `quad`');
	var st=quad.subject.toNT(), pt=quad.predicate.toNT(), ot=quad.object.toNT(), gt=quad.graph.toNT();
	return isIndex(this.indexSPOG, st, pt, ot, gt, quad);
};
Dataset.prototype.removeMatches = function(s, p, o, g) {
	var self = this;
	this.match(s, p, o, g).forEach(function(t) {
		self.remove(t);
	});
};
Dataset.prototype.deleteMatches = Dataset.prototype.removeMatches;
Dataset.prototype.clear = function(){
	this.indexSPOG = {};
	this.indexPOGS = {};
	this.indexOGSP = {};
	this.indexGSPO = {};
	this.indexGPOS = {};
	this.indexOSGP = {};
	this.length = 0;
};
Dataset.prototype.import = function(s) {
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.add(s.get(i));
	}
};
Dataset.prototype.every = function every(filter) { return this.toArray().every(filter); };
Dataset.prototype.some = function some(filter) { return this.toArray().some(filter); };
Dataset.prototype.forEach = function forEach(callbck) { this.toArray().forEach(callbck); };
Dataset.prototype.toArray = function toArray() {
	var quads = [];
	var data = this.indexSPOG;
	if(!data) return [];
	(function go(data, c){
		if(c) Object.keys(data).forEach(function(t){go(data[t], c-1);});
		else quads.push(data);
	})(data, 4);
	return quads;
};
Dataset.prototype.filter = function filter(cb){
	var result = new Dataset;
	this.forEach(function(quad){
		if(cb(quad)) result.add(quad);
	});
	return result;
};
Dataset.prototype.getCollection = function getCollection(subject){
	var collection=[], seen=[];
	var first, rest=subject;
	while(rest && !rest.equals(rdfnil)){
		var g = this.match(rest, rdffirst, null);
		if(g.length===0) throw new Error('Collection <'+rest+'> is incomplete');
		first = g.toArray().map(function(v){return v.object;})[0];
		if(seen.indexOf(rest.toString())!==-1) throw new Error('Collection <'+rest+'> is circular');
		seen.push(rest.toString());
		collection.push(first);
		rest = this.match(rest, rdfrest, null).toArray().map(function(v){return v.object;})[0];
	}
	return collection;
};
// FIXME ensure that the RDFNode#equals semantics are met

Dataset.prototype.match = function match(subject, predicate, object, graph){
	// if the String prototype has a nodeType/toNT function, builtins is enabled,
	if(typeof subject=="string" && typeof subject.toNT!='function') subject = new RDFNode.NamedNode(subject);
	if(subject!==null && !RDFNode.RDFNode.is(subject)) throw new Error('match subject is not an RDFNode');
	if(subject!==null && subject.termType!=='NamedNode' && subject.termType!=='BlankNode') throw new Error('match subject must be a NamedNode/BlankNode');
	if(typeof predicate=="string" && typeof predicate.toNT!='function') predicate = new RDFNode.NamedNode(predicate);
	if(predicate!==null && !RDFNode.RDFNode.is(predicate)) throw new Error('match predicate is not an RDFNode');
	if(predicate!==null && predicate.termType!=='NamedNode') throw new Error('match predicate must be a NamedNode');
	if(typeof object=="string" && typeof object.toNT!='function') object = new RDFNode.NamedNode(object);
	if(object!==null && !RDFNode.RDFNode.is(object)) throw new Error('match object is not an RDFNode');
	if(object!==null && object.termType!=='NamedNode' && object.termType!=='BlankNode' && object.termType!=='Literal') throw new Error('match object must be a NamedNode/BlankNode/Literal');
	if(typeof graph=="string" && typeof graph.toNT!='function') graph = new RDFNode.NamedNode(graph);
	if(graph!==null && !RDFNode.RDFNode.is(graph)) throw new Error('match graph is not an RDFNode');
	if(graph!==null && graph.termType!=='NamedNode') throw new Error('match graph must be a NamedNode');
	var result = new Dataset;
	var pattern = {s:subject&&subject.toNT(), p:predicate&&predicate.toNT(), o:object&&object.toNT(), g:graph&&graph.toNT()};
	var patternIndexMap = [
		{index:this.indexSPOG, constants:["s", "p", "o", "g"], variables:[]},
		{index:this.indexSPOG, constants:["s", "p", "o"], variables:["g"]},
		{index:this.indexGSPO, constants:["s", "p", "g"], variables:["o"]},
		{index:this.indexSPOG, constants:["s", "p"], variables:["o", "g"]},
		{index:this.indexOSGP, constants:["s", "o", "g"], variables:["p"]},
		{index:this.indexOSGP, constants:["s", "o"], variables:["p", "g"]},
		{index:this.indexGSPO, constants:["s", "g"], variables:["p", "o"]},
		{index:this.indexSPOG, constants:["s"], variables:["p", "o", "g"]},
		{index:this.indexPOGS, constants:["p", "o", "g"], variables:["s"]},
		{index:this.indexPOGS, constants:["p", "o"], variables:["s", "g"]},
		{index:this.indexGPOS, constants:["p", "g"], variables:["s", "o"]},
		{index:this.indexPOGS, constants:["p"], variables:["s", "o", "g"]},
		{index:this.indexOGSP, constants:["o", "g"], variables:["s", "p"]},
		{index:this.indexOGSP, constants:["o"], variables:["s", "p", "g"]},
		{index:this.indexGSPO, constants:["g"], variables:["s", "p", "o"]},
		{index:this.indexSPOG, constants:[], variables:["s", "p", "o", "g"]},
	];
	var patternType = 0;
	if(!pattern.s) patternType |= 8;
	if(!pattern.p) patternType |= 4;
	if(!pattern.o) patternType |= 2;
	if(!pattern.g) patternType |= 1;
	var index = patternIndexMap[patternType];
	var data = index.index;
	index.constants.forEach(function(v){if(data) data=data[pattern[v]];});
	if(!data) return result;
	(function go(data, c){
		if(c) return void Object.keys(data).forEach(function(t){go(data[t], c-1);});
		if(subject && !data.subject.equals(subject)) throw new Error('assertion fail: subject');
		if(predicate && !data.predicate.equals(predicate)) throw new Error('assertion fail: predicate');
		if(object && !data.object.equals(object)) throw new Error('assertion fail: object');
		if(graph && !data.graph.equals(graph)) throw new Error('assertion fail: graph');
		result.add(data);
	})(data, index.variables.length);
	return result;
};

// Gets a reference to a particular subject
// Graph.prototype.reference = function reference(subject){
// 	return new ResultSet.ResultSet(this, subject);
// };
