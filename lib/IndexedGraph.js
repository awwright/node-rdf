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
api.IndexedGraph = function(a){
	this.length = 0;
	this.graph = [];
	this.index = {};
	if(Array.isArray(a)) this.importArray(a);
};
api.IndexedGraph.prototype = {
	importArray: function(a){ while( a.length > 0){ this.add(a.pop()) } },
	get: function(index){ return this.graph[index] },
	add: function(triple){
		if(!this.index[triple.subject.value]) this.index[triple.subject.value] = {};
		if(!this.index[triple.subject.value][triple.predicate.value]) this.index[triple.subject.value][triple.predicate.value] = [];
		if(this.index[triple.subject.value][triple.predicate.value].some(function(o){return RDFNodeEquals.call(o,triple.object)})) return;
		this.length++;
		this.index[triple.subject.value][triple.predicate.value].push(triple.object);
		this.graph.push(triple);
	},
	merge: function(s){
		var _g1 = 0, _g = s.length;
		while(_g1 < _g){
			var i = _g1++;
			this.add(s.get(i))
		}
	},
	every: function(filter){ return this.graph.every(filter) },
	some: function(filter){ return this.graph.some(filter) },
	forEach: function(callbck){ this.graph.forEach(callbck) },
	filter: function(filter){
		if(!filter) return this.index;
		// FIXME x.resolve() may not exist
		if(typeof(filter.subject)=="string") filter.subject=filter.subject.resolve();
		if(typeof(filter.predicate)=="string") filter.predicate=filter.predicate.resolve();
		if(typeof(filter.object)=="string") filter.object=filter.object.resolve();
		return this.graph.filter(function(t){
			if(filter.subject && filter.subject!=t.subject) return false;
			if(filter.predicate && filter.predicate!=t.predicate) return false;
			if(filter.object && filter.object!=t.object) return false;
			return true;
		});
	},
	apply: function(filter){ this.graph = this.graph.filter(filter); this.length = this.graph.length; },
	toArray: function(){ return this.graph.slice() }
};
