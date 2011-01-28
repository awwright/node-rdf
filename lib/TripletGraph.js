/**
 * The very fastest graph for heavy read operations, but uses three indexes
 * TripletGraph (fast, triple indexed) implements DataStore

RDFa API:
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

var api = exports;

api.TripletGraph = function(){
	this.clear();
	Object.defineProperty(this, 'size', {get: function(){return self.size;}});
}
api.TripletGraph.prototype = {
	length: null, graph: null,
	importArray: function(a) { while( a.length > 0) { this.add(a.pop()) } },
	get: function(index) { return this.graph[index] },
	insertIndex: function(i, a, b, c, t){
		if(!i[a]) i[a] = {};
		if(!i[a][b]) i[a][b] = {};
		i[a][b][c] = t;
	},
	deleteIndex: function(i, a, b, c){
		delete(i[a][b][c]);
		if(!Object.keys(i[a][b]).length) delete(i[a][b]);
		if(!Object.keys(i[a]).length) delete(i[a]);
	},
	add: function(triple) {
		insertIndex(this.indexOPS, triple.object, triple.property, triple.subject, true);
		insertIndex(this.indexPSO, triple.property, triple.subject, triple.object, true);
		insertIndex(this.indexSOP, triple.subject, triple.object, triple.property, true);
		this.length++;
	},
	remove: function(triple) {
		deleteIndex(this.indexOPS, triple.object, triple.property, triple.subject);
		deleteIndex(this.indexPSO, triple.property, triple.subject, triple.object);
		deleteIndex(this.indexSOP, triple.subject, triple.object, triple.property);
		this.length--;
	}
	clear: function(){
		this.indexSOP = {};
		this.indexPSO = {};
		this.indexOPS = {};
		this.length = 0;
	}
	createPlainLiteral: function(){},
	createTypedLiteral: function(){},
	createBlankNode: function(){},
	createTriple: function(){},
	import: function(s) {
		var _g1 = 0, _g = s.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.add(s.get(i))
		}
	},
	every: function(filter) { return this.graph.every(filter) },
	some: function(filter) { return this.graph.some(filter) },
	forEach: function(callbck) { this.graph.forEach(callbck) },
	//filter: function(filter) { return new api.Graph(this.graph.filter(filter)); },
	apply: function(filter) { this.graph = this.graph.filter(filter); this.length = this.graph.length; },
	toArray: function() { return this.graph.slice() },
	find: function(subject, predicate, object){
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
		if(subject===null) patternType |= 4;
		if(predicate===null) patternType |= 2;
		if(object===null) patternType |= 1;
		
	}
};
