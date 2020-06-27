"use strict";

var RDFNode = require('./RDFNode.js');
var ResultSet = require('./ResultSet.js');

/**
 * The very fastest graph for heavy read operations, but uses three indexes
 * Graph (fast, triple indexed) implements DataStore

[NoInterfaceObject]
interface Graph {
    readonly attribute unsigned long          length;
    Graph            add (in Triple triple);
    Graph            remove (in Triple triple);
    Graph            removeMatches (in any? subject, in any? predicate, in any? object);
    sequence<Triple> toArray ();
    boolean          some (in TripleFilter callback);
    boolean          every (in TripleFilter callback);
    Graph            filter (in TripleFilter filter);
    void             forEach (in TripleCallback callback);
    Graph            match (in any? subject, in any? predicate, in any? object, in optional unsigned long limit);
    Graph            merge (in Graph graph);
    Graph            addAll (in Graph graph);
    readonly attribute sequence<TripleAction> actions;
    Graph            addAction (in TripleAction action, in optional boolean run);
};

*/

/**
 * Read an RDF Collection and return it as an Array
 */
var rdfnil = new RDFNode.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil');
var rdffirst = new RDFNode.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first');
var rdfrest = new RDFNode.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest');

function getKey(node){
	if(!node) return node;
	switch(node.termType){
		case 'Literal': return node.datatype + node.language + ' ' + node.value;
	}
	return node.value;
}

function isIndex(i, a, b, c, t){
	if(!i[a]) return false;
	if(!i[a][b]) return false;
	return i[a][b][c] ? i[a][b][c].equals(t) : false ;
}

function insertIndex(i, a, b, c, t){
	if(!i[a]) i[a] = {};
	if(!i[a][b]) i[a][b] = {};
	i[a][b][c] = t;
}

function deleteIndex(i, a, b, c, t){
	if(i[a]&&i[a][b]&&i[a][b][c]){
		if(!i[a][b][c].equals(t)) throw new Error('assertion fail: deleted triple mismatch');
		delete(i[a][b][c]);
		if(!Object.keys(i[a][b]).length) delete(i[a][b]);
		if(!Object.keys(i[a]).length) delete(i[a]);
	}
}

exports.Graph = Graph;
function Graph(init){
	this.clear();
	//this._actions = [];
	Object.defineProperty(this, 'size', {get: function(){return self.length;}});
	var self = this;
	if(init && init.forEach){
		init.forEach(function(t){ self.add(t); });
	}
}
Graph.prototype.length = null;
Graph.prototype.graph = null;

Graph.prototype.importArray = function(a) { while( a.length > 0) { this.add(a.pop()); } };

Graph.prototype.insertIndex = insertIndex;
Graph.prototype.deleteIndex = deleteIndex;
Graph.prototype.add = function(triple) {
	if(!(triple instanceof RDFNode.Triple)) throw new TypeError('Expected a Triple for argument[0] `triple`');
	var st=getKey(triple.subject), pt=getKey(triple.predicate), ot=getKey(triple.object);
	if(isIndex(this.indexSOP, st, ot, pt, triple)) return;
	insertIndex(this.indexOPS, ot, pt, st, triple);
	insertIndex(this.indexPSO, pt, st, ot, triple);
	insertIndex(this.indexSOP, st, ot, pt, triple);
	this.length++;
	//this.actions.forEach(function(fn){ fn(triple); });
};
Graph.prototype.addAll = function(g){
	var g2 = this;
	g.forEach(function(s){ g2.add(s); });
};
Graph.prototype.union = function union(g){
	var gx = new Graph;
	gx.addAll(this);
	gx.addAll(g);
	return gx;
};
Graph.prototype.merge = Graph.prototype.union;
Graph.prototype.remove = function(triple) {
	var st=getKey(triple.subject), pt=getKey(triple.predicate), ot=getKey(triple.object);
	if(!isIndex(this.indexSOP, st, ot, pt, triple)) return;
	deleteIndex(this.indexOPS, ot, pt, st, triple);
	deleteIndex(this.indexPSO, pt, st, ot, triple);
	deleteIndex(this.indexSOP, st, ot, pt, triple);
	this.length--;
};
Graph.prototype.delete = Graph.prototype.remove;
Graph.prototype.has = function(triple) {
	var st=getKey(triple.subject), pt=getKey(triple.predicate), ot=getKey(triple.object);
	return isIndex(this.indexSOP, st, ot, pt, triple);
};
Graph.prototype.removeMatches = function(s, p, o) {
	var graph = this;
	this.match(s, p, o).forEach(function(t) {
		graph.remove(t);
	});
};
Graph.prototype.deleteMatches = Graph.prototype.removeMatches;
Graph.prototype.clear = function(){
	this.indexSOP = {};
	this.indexPSO = {};
	this.indexOPS = {};
	this.length = 0;
};
Graph.prototype.import = function(s) {
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.add(s.get(i));
	}
};
Graph.prototype.every = function every(filter) { return this.toArray().every(filter); };
Graph.prototype.some = function some(filter) { return this.toArray().some(filter); };
Graph.prototype.forEach = function forEach(callbck) { this.toArray().forEach(callbck); };
Graph.prototype.toArray = function toArray() {
	var triples = [];
	var data = this.indexPSO;
	if(!data) return [];
	(function go(data, c){
		if(c) Object.keys(data).forEach(function(t){go(data[t], c-1);});
		else triples.push(data);
	})(data, 3);
	return triples;
};
Graph.prototype.filter = function filter(cb){
	var result = new Graph;
	this.forEach(function(triple){
		if(cb(triple)) result.add(triple);
	});
	return result;
};
Graph.prototype.getCollection = function getCollection(subject){
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
// FIXME this should return a Graph, not an Array
// FIXME ensure that the RDFNode#equals semantics are met
Graph.prototype.match = function match(subject, predicate, object){
	if(typeof subject=="string") subject = new RDFNode.NamedNode(subject);
	if(subject!==null && !RDFNode.RDFNode.is(subject)) throw new Error('match subject is not an RDFNode');
	if(subject!==null && subject.termType!=='NamedNode' && subject.termType!=='BlankNode') throw new Error('match subject must be a NamedNode/BlankNode');
	if(typeof predicate=="string") predicate = new RDFNode.NamedNode(predicate);
	if(predicate!==null && !RDFNode.RDFNode.is(predicate)) throw new Error('match predicate is not an RDFNode');
	if(predicate!==null && predicate.termType!=='NamedNode') throw new Error('match predicate must be a NamedNode');
	if(typeof object=="string") object = new RDFNode.NamedNode(object);
	if(object!==null && !RDFNode.RDFNode.is(object)) throw new Error('match object is not an RDFNode');
	if(object!==null && object.termType!=='NamedNode' && object.termType!=='BlankNode' && object.termType!=='Literal') throw new Error('match object must be a NamedNode/BlankNode/Literal');
	var triples = new Graph;
	var pattern = {s:subject&&getKey(subject), p:predicate&&getKey(predicate), o:getKey(object)};
	var patternIndexMap = [
		{index:this.indexOPS, constants:["o", "p", "s"], variables:[]},
		{index:this.indexPSO, constants:["p", "s"], variables:["o"]},
		{index:this.indexSOP, constants:["s", "o"], variables:["p"]},
		{index:this.indexSOP, constants:["s"], variables:["o", "p"]},
		{index:this.indexOPS, constants:["o", "p"], variables:["s"]},
		{index:this.indexPSO, constants:["p"], variables:["s", "o"]},
		{index:this.indexOPS, constants:["o"], variables:["p", "s"]},
		{index:this.indexPSO, constants:[], variables:["p", "s", "o"]},
	];
	var patternType = 0;
	if(!pattern.s) patternType |= 4;
	if(!pattern.p) patternType |= 2;
	if(!pattern.o) patternType |= 1;
	var index = patternIndexMap[patternType];
	var data = index.index;
	index.constants.forEach(function(v){if(data) data=data[pattern[v]];});
	if(!data) return triples;
	(function go(data, c){
		if(c) return void Object.keys(data).forEach(function(t){go(data[t], c-1);});
		if(subject && !data.subject.equals(subject)) throw new Error('assertion fail: subject');
		if(predicate && !data.predicate.equals(predicate)) throw new Error('assertion fail: predicate');
		if(object && !data.object.equals(object)) throw new Error('assertion fail: object');
		triples.add(data);
	})(data, index.variables.length);
	return triples;
};

var GraphEquals = require('./GraphEquals.js');
Graph.prototype.isomorphic = function isomorphic(b){
	return GraphEquals(this, b);
};
Graph.prototype.equals = function equals(b){
	return GraphEquals(this, b);
};
var GraphSimplyEntails = require('./GraphSimplyEntails.js');
Graph.prototype.simplyEntails = function simplyEntails(subset){
	var reference = this;
	return GraphSimplyEntails(reference, subset);
};

//Graph.prototype.addAction = function(action, run){
//	this._actions.push(action);
//	if(run){
//		this.forEach(action);
//	}
//}
//
//Object.defineProperty(Graph.prototype, 'actions', { get: function(){ return this._actions; } });

// Gets a reference to a particular subject
Graph.prototype.reference = function reference(subject){
	return new ResultSet.ResultSet(this, subject);
};
