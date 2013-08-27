var api = exports;
var RDFNodeEquals = require('./RDFNode').RDFNodeEquals;

/**
 * Graph (fast, indexed) implements DataStore

[NoInterfaceObject]
interface DataStore {
    readonly attribute unsigned long size;
    getter RDFTriple get (in unsigned long index);
    boolean          add (in RDFTriple triple);
    IRI              createIRI (in DOMString iri, in optional Node node);
    PlainLiteral     createPlainLiteral (in DOMString value, in optional DOMString? language);
    TypedLiteral     createTypedLiteral (in DOMString value, in DOMString type);
    BlankNode        createBlankNode (in optional DOMString name);
    RDFTriple        createTriple (in RDFResource subject, in IRI property, in RDFNode object);
    [Null=Null]
    DataStore        filter (in optional Object? pattern, in optional Element? element, in optional RDFTripleFilter filter);
    void             clear ();
    void             forEach (in DataStoreIterator iterator);
    boolean          merge (in DataStore store);
};

 */

var getCollection = require('./Graph.js').getCollection;

api.IndexedGraph = function IndexedGraph(a){
	this.length = 0;
	this.graph = [];
	this.index = {};
	if(Array.isArray(a)) this.importArray(a);
};

api.IndexedGraph.prototype.importArray = function(a){ while( a.length > 0){ this.add(a.pop()) } };
api.IndexedGraph.prototype.get = function(index){ return this.graph[index] };
api.IndexedGraph.prototype.add = function(triple){
	var s=triple.subject.toString();
	var p=triple.predicate.toString();
	var o=triple.object.toString();
	if(!this.index[s]) this.index[s] = {};
	if(!this.index[s][p]) this.index[s][p] = [];
	if(this.index[s][p].some(function(o){return RDFNodeEquals.call(o,triple.object)})) return;
	this.length++;
	this.index[s][p].push(triple.object);
	this.graph.push(triple);
};
api.IndexedGraph.prototype.merge = function(s){
	var _g1 = 0, _g = s.length;
	while(_g1 < _g){
		var i = _g1++;
		this.add(s.get(i))
	}
};
api.IndexedGraph.prototype.every = function(filter){ return this.graph.every(filter) };
api.IndexedGraph.prototype.some = function(filter){ return this.graph.some(filter) };
api.IndexedGraph.prototype.forEach = function(cb){ this.graph.forEach(cb) };
api.IndexedGraph.prototype.filter = function(cb){ this.graph.filter(cb) };
api.IndexedGraph.prototype.getCollection = getCollection;
api.IndexedGraph.prototype.match = function(subject, predicate, object){
	return this.graph.filter(function(t){
		if(subject && !RDFNodeEquals.call(subject,t.subject)) return false;
		if(predicate && !RDFNodeEquals.call(predicate,t.predicate)) return false;
		if(object && !RDFNodeEquals.call(object,t.object)) return false;
		return true;
	});
};
api.IndexedGraph.prototype.apply = function(filter){ this.graph = this.graph.filter(filter); this.length = this.graph.length; };
api.IndexedGraph.prototype.toArray = function(){ return this.graph.slice() };
