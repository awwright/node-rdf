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
var rdfnil = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';
var rdffirst = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
var rdfrest = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';

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

function deleteIndex(i, a, b, c){
	if(i[a]&&i[a][b]&&i[a][b][c]){
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

Graph.prototype.importArray = function(a) { while( a.length > 0) { this.add(a.pop()) } };

Graph.prototype.insertIndex = insertIndex;
Graph.prototype.deleteIndex = deleteIndex;
Graph.prototype.add = function(triple) {
	if(!(triple instanceof RDFNode.Triple)) throw new TypeError('Expected a Triple for argument[0] `triple`');
	if(isIndex(this.indexSOP, triple.subject, triple.object, triple.predicate, triple)) return;
	insertIndex(this.indexOPS, triple.object, triple.predicate, triple.subject, triple);
	insertIndex(this.indexPSO, triple.predicate, triple.subject, triple.object, triple);
	insertIndex(this.indexSOP, triple.subject, triple.object, triple.predicate, triple);
	this.length++;
	//this.actions.forEach(function(fn){ fn(triple); });
};
Graph.prototype.addAll = function(g){
	var g2 = this;
	g.forEach(function(s){ g2.add(s); });
};
Graph.prototype.merge = function(g){
	var gx = new Graph;
	gx.addAll(this);
	gx.addAll(g);
	return gx;
};
Graph.prototype.remove = function(triple) {
	if(!isIndex(this.indexSOP, triple.subject, triple.object, triple.predicate, triple)) return;
	deleteIndex(this.indexOPS, triple.object, triple.predicate, triple.subject);
	deleteIndex(this.indexPSO, triple.predicate, triple.subject, triple.object);
	deleteIndex(this.indexSOP, triple.subject, triple.object, triple.predicate);
	this.length--;
}
Graph.prototype.removeMatches = function(s, p, o) {
	var graph = this;
	this.match(s, p, o).forEach(function(t) {
		graph.remove(t);
	});
}
Graph.prototype.clear = function(){
	this.indexSOP = {};
	this.indexPSO = {};
	this.indexOPS = {};
	this.length = 0;
}
Graph.prototype.import = function(s) {
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.add(s.get(i))
	}
};
Graph.prototype.every = function every(filter) { return this.toArray().every(filter) };
Graph.prototype.some = function some(filter) { return this.toArray().some(filter) };
Graph.prototype.forEach = function forEach(callbck) { this.toArray().forEach(callbck) };
Graph.prototype.apply = function apply(filter) { this.graph = this.toArray().filter(filter); this.length = this.graph.length; };
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
	while(rest && rest!=rdfnil){
		first = this.match(rest, rdffirst).toArray().map(function(v){return v.object})[0];
		if(first===undefined) throw new Error('Collection <'+rest+'> is incomplete');
		if(seen.indexOf(rest)!==-1) throw new Error('Collection <'+rest+'> is circular');
		seen.push(rest);
		collection.push(first);
		rest = this.match(rest, rdfrest).toArray().map(function(v){return v.object})[0];
	}
	return collection;
};
// FIXME this should return a Graph, not an Array
// FIXME ensure that the RDFNode#equals semantics are met
Graph.prototype.match = function match(subject, predicate, object){
	var triples = new Graph;
	var pattern = {s:subject,p:predicate,o:object};
	var patternIndexMap =
		[ {index:this.indexOPS, constants:["o", "p", "s"], variables:[]}
		, {index:this.indexPSO, constants:["p", "s"], variables:["o"]}
		, {index:this.indexSOP, constants:["s", "o"], variables:["p"]}
		, {index:this.indexSOP, constants:["s"], variables:["o", "p"]}
		, {index:this.indexOPS, constants:["o", "p"], variables:["s"]}
		, {index:this.indexPSO, constants:["p"], variables:["s", "o"]}
		, {index:this.indexOPS, constants:["o"], variables:["p", "s"]}
		, {index:this.indexPSO, constants:[], variables:["p", "s", "o"]}
		];
	var patternType = 0;
	if(!pattern.s) patternType |= 4;
	if(!pattern.p) patternType |= 2;
	if(!pattern.o) patternType |= 1;
	var index = patternIndexMap[patternType];
	var data = index.index;
	index.constants.forEach(function(v){if(data) data=data[pattern[v]];});
	if(!data) return [];
	(function go(data, c){
		if(c) Object.keys(data).forEach(function(t){go(data[t], c-1);});
		else triples.add(data);
	})(data, index.variables.length);
	return triples;
};

var GraphEquals = require('./GraphEquals.js');
Graph.prototype.equals = function equals(b){
	return GraphEquals(this, b);
}

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
