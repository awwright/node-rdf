/**
 * The very fastest graph for heavy read operations, but uses three indexes
 * TripletGraph (fast, triple indexed) implements DataStore
 */

var getCollection = require('./Graph.js').getCollection;
var api = exports;

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

api.TripletGraph = function(){
	this.clear();
	Object.defineProperty(this, 'size', {get: function(){return self.length;}});
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
api.TripletGraph.prototype.remove = function(triple) {
	deleteIndex(this.indexOPS, triple.object, triple.predicate, triple.subject);
	deleteIndex(this.indexPSO, triple.predicate, triple.subject, triple.object);
	deleteIndex(this.indexSOP, triple.subject, triple.object, triple.predicate);
	this.length--;
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
api.TripletGraph.prototype.every = function(filter) { return this.toArray().every(filter) };
api.TripletGraph.prototype.some = function(filter) { return this.toArray().some(filter) };
api.TripletGraph.prototype.forEach = function(callbck) { this.toArray().forEach(callbck) };
api.TripletGraph.prototype.apply = function(filter) { this.graph = this.toArray().filter(filter); this.length = this.graph.length; };
api.TripletGraph.prototype.toArray = function() { return this.match(); };
api.TripletGraph.prototype.filter = function(cb){ return this.toArray().filter(cb) };
api.TripletGraph.prototype.getCollection = getCollection;
api.TripletGraph.prototype.match = function(subject, predicate, object){
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
