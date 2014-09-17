/**
 * The very fastest graph for heavy read operations, but uses three indexes
 * TripletGraph (fast, triple indexed) implements DataStore

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
var api = exports;

/**
 * Read an RDF Collection and return it as an Array
 */
var rdfnil = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';
var rdffirst = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
var rdfrest = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';

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

api.Graph = api.TripletGraph = function TripletGraph(init){
	this.clear();
	Object.defineProperty(this, 'size', {get: function(){return self.length;}});
	var self = this;
	if(init && init.forEach){
		init.forEach(function(t){ self.add(t); });
	}
}
api.TripletGraph.prototype.length = null;
api.TripletGraph.prototype.graph = null;

api.TripletGraph.prototype.importArray = function(a) { while( a.length > 0) { this.add(a.pop()) } };

api.TripletGraph.prototype.insertIndex = insertIndex;
api.TripletGraph.prototype.deleteIndex = deleteIndex;
api.TripletGraph.prototype.add = function(triple) {
	insertIndex(this.indexOPS, triple.object, triple.predicate, triple.subject, triple);
	insertIndex(this.indexPSO, triple.predicate, triple.subject, triple.object, triple);
	insertIndex(this.indexSOP, triple.subject, triple.object, triple.predicate, triple);
	this.length++;
};
api.TripletGraph.prototype.addAll = function(g){
	var g2 = this;
	g.forEach(function(s){ g2.add(s); });
};
api.TripletGraph.prototype.merge = function(g){
	var gx = new api.TripletGraph;
	gx.addAll(this);
	gx.addAll(g);
	return gx;
};
api.TripletGraph.prototype.remove = function(triple) {
	deleteIndex(this.indexOPS, triple.object, triple.predicate, triple.subject);
	deleteIndex(this.indexPSO, triple.predicate, triple.subject, triple.object);
	deleteIndex(this.indexSOP, triple.subject, triple.object, triple.predicate);
	this.length--;
}
api.TripletGraph.prototype.removeMatches = function(triple) {
	// TODO
}
api.TripletGraph.prototype.clear = function(){
	this.indexSOP = {};
	this.indexPSO = {};
	this.indexOPS = {};
	this.length = 0;
}
api.TripletGraph.prototype.import = function(s) {
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.add(s.get(i))
	}
};
api.TripletGraph.prototype.every = function every(filter) { return this.toArray().every(filter) };
api.TripletGraph.prototype.some = function some(filter) { return this.toArray().some(filter) };
api.TripletGraph.prototype.forEach = function forEach(callbck) { this.toArray().forEach(callbck) };
api.TripletGraph.prototype.apply = function apply(filter) { this.graph = this.toArray().filter(filter); this.length = this.graph.length; };
api.TripletGraph.prototype.toArray = function toArray() { return this.match(); };
api.TripletGraph.prototype.filter = function filter(cb){ return this.toArray().filter(cb) };
api.TripletGraph.prototype.getCollection = function getCollection(subject){
	var collection=[], seen=[];
	var first, rest=subject;
	while(rest && rest!=rdfnil){
		first = this.match(rest, rdffirst).map(function(v){return v.object})[0];
		if(first===undefined) throw new Error('Collection <'+rest+'> is incomplete');
		if(seen.indexOf(rest)!==-1) throw new Error('Collection <'+rest+'> is circular');
		seen.push(rest);
		collection.push(first);
		rest = this.match(rest, rdfrest).map(function(v){return v.object})[0];
	}
	return collection;
};
// FIXME this should return a Graph, not an Array
// FIXME ensure that the RDFNode#equals semantics are met
api.TripletGraph.prototype.match = function match(subject, predicate, object){
	var triples = [];
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
		else triples.push(data);
	})(data, index.variables.length);
	return triples;
};
