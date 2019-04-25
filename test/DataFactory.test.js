var assert = require('assert');
var rdf = require('..');
var factory = rdf.factory;

/*
// Presumably these are implemented by the same object, even though the WebIDL doesn't seem to indicate as such

interface DataFactory {
  NamedNode namedNode(string value);
  BlankNode blankNode(optional string value);
  Literal literal(string value, optional (string or NamedNode) languageOrDatatype);
  Variable variable(string value);
  DefaultGraph defaultGraph();
  Quad quad(Term subject, Term predicate, Term object, optional Term? graph);
  Term fromTerm(Term original);
  Quad fromQuad(Quad original);
};
interface DatasetCoreFactory {
  DatasetCore dataset (optional sequence<Quad> quads);
};
*/

function DataFactoryTests(){
	it("default instance", function(){
		assert(rdf.factory instanceof rdf.DataFactory);
	});
	it("namedNode", function(){
		assert(factory.namedNode("http://example.com/") instanceof rdf.NamedNode);
		assert(factory.namedNode("http://example.com/").equals(new rdf.NamedNode('http://example.com/')));
		assert(!factory.namedNode("http://example.com/").equals(new rdf.NamedNode('http://foo.example.net/')));
	});
	it("blankNode", function(){
		assert(factory.blankNode() instanceof rdf.BlankNode);
		assert(factory.blankNode("foo") instanceof rdf.BlankNode);
	});
	it("literal", function(){
		assert(factory.literal("foo bar") instanceof rdf.Literal);
		assert(factory.literal("foo bar").equals(new rdf.Literal('foo bar')));
		assert(!factory.literal("foo bar").equals(new rdf.Literal('foo bar', '@en')));
	});
	it("variable", function(){
		assert(factory.variable("n") instanceof rdf.Variable);
		assert(factory.variable("n").equals(new rdf.Variable('n')));
		assert(!factory.variable("n").equals(new rdf.Variable('q')));
	});
	it("defaultGraph", function(){
		assert(factory.defaultGraph() instanceof rdf.DefaultGraph);
		assert(factory.defaultGraph()===factory.defaultGraph());
	});
	it("triple", function(){
		assert(factory.triple(factory.namedNode("http://example.com/"), factory.namedNode("http://example.com/"), factory.namedNode("http://example.com/")) instanceof rdf.Triple);
		assert(factory.triple(factory.namedNode("http://example.com/"), factory.namedNode("http://example.com/"), factory.namedNode("http://example.com/")).equals(new rdf.Triple(new rdf.NamedNode("http://example.com/"), new rdf.NamedNode("http://example.com/"), new rdf.NamedNode("http://example.com/"), new rdf.NamedNode("http://example.com/"))));
	});
	it("quad", function(){
		assert(factory.quad(factory.namedNode("http://example.com/"), factory.namedNode("http://example.com/"), factory.namedNode("http://example.com/")) instanceof rdf.Quad);
		assert(factory.quad(factory.namedNode("http://example.com/"), factory.namedNode("http://example.com/"), factory.namedNode("http://example.com/")).equals(new rdf.Quad(new rdf.NamedNode("http://example.com/"), new rdf.NamedNode("http://example.com/"), new rdf.NamedNode("http://example.com/"), new rdf.DefaultGraph)));
	});
	it("dataset", function(){
		assert(factory.dataset() instanceof rdf.Dataset);
	});
	describe("fromTerm", function(){
		it("fromTerm(NamedNode)", function(){
			var term = factory.fromTerm({termType:'NamedNode', value:'http://example.com/'});
			assert(term instanceof rdf.NamedNode);
			assert(term.equals(new rdf.NamedNode('http://example.com/')));
			assert(!term.equals(new rdf.NamedNode('http://foo.example.net/')));
		});
		it("fromTerm(BlankNode)", function(){
			var term = factory.fromTerm({termType:'BlankNode', value:'b1'});
			assert(term instanceof rdf.BlankNode);
		});
		it("fromTerm(xsd:string)", function(){
			var term = factory.fromTerm({termType:'Literal', value:'foo', datatype:{termType:"NamedNode", value:rdf.xsdns("string")}});
			assert(term instanceof rdf.Literal);
			assert(term.equals(new rdf.Literal('foo', rdf.xsdns("string"))));
			assert(term.equals(new rdf.Literal('foo')));
			assert(!term.equals(new rdf.Literal('foo', '@en')));
		});
		it("fromTerm(xsd:boolean)", function(){
			var term = factory.fromTerm({termType:'Literal', value:'foo', datatype:{termType:"NamedNode", value:rdf.xsdns("boolean")}});
			assert(term instanceof rdf.Literal);
			assert(term.equals(new rdf.Literal('foo', rdf.xsdns("boolean"))));
			assert(!term.equals(new rdf.Literal('foo')));
		});
		it("fromTerm(rdf:langString)", function(){
			var term = factory.fromTerm({termType:'Literal', value:'foo', datatype:{termType:"NamedNode", value:rdf.rdfns("langString")}, language:"en"});
			assert(term instanceof rdf.Literal);
			assert(term.equals(new rdf.Literal('foo', '@en')));
			assert(!term.equals(new rdf.Literal('foo')));
		});
		it("fromTerm(Variable)", function(){
			var term = factory.fromTerm({termType:'Variable', value:'name'});
			assert(term instanceof rdf.Variable);
			assert(term.equals(new rdf.Variable('name')));
			assert(!term.equals(new rdf.Variable('baz')));
		});
		it("fromTerm(DefaultGraph)", function(){
			var term = factory.fromTerm({termType:'DefaultGraph', value:''});
			assert(term instanceof rdf.DefaultGraph);
			assert(term.equals(factory.defaultGraph()));
			assert(!term.equals(factory.namedNode('http://example.com/')));
		});
	});
	it("fromTriple", function(){
		var quad = factory.fromTriple({
			subject: {termType:"NamedNode", value:"http://example.com/"},
			predicate: {termType:"NamedNode", value:"http://example.com/"},
			object: {termType:"NamedNode", value:"http://example.com/"},
		});
		assert(quad instanceof rdf.Triple);
		assert(quad.equals(new rdf.Triple('http://example.com/', 'http://example.com/', 'http://example.com/')));
		assert(!quad.equals(new rdf.Triple('http://example.com/', 'http://example.com/', 'http://foo.example.net/')));
	});
	it("fromQuad", function(){
		var quad = factory.fromQuad({
			subject: {termType:"NamedNode", value:"http://example.com/"},
			predicate: {termType:"NamedNode", value:"http://example.com/"},
			object: {termType:"NamedNode", value:"http://example.com/"},
			graph: {termType:"DefaultGraph"},
		});
		assert(quad instanceof rdf.Quad);
		assert(quad.equals(new rdf.Quad('http://example.com/', 'http://example.com/', 'http://example.com/', factory.defaultGraph())));
		assert(!quad.equals(new rdf.Quad('http://example.com/', 'http://example.com/', 'http://foo.example.net/', factory.defaultGraph())));
	});
}

describe('factory', DataFactoryTests);

describe('factory (with builtins)', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});
	DataFactoryTests();
});
