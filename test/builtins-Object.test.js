var assert = require('assert');
var rdf = require('..');
var env = rdf.environment;
var util = require('util');

function triple(s, p, o){
	// Don't normally use `new rdf.BlankNode`, except where determinism in output is needed
	return rdf.environment.createTriple(
		typeof s=='string' ? (s.substring(0,2)=='_:' ? new rdf.BlankNode(s) : rdf.environment.createNamedNode(s)) : s ,
		typeof p=='string' ? (p.substring(0,2)=='_:' ? new rdf.BlankNode(p) : rdf.environment.createNamedNode(p)) : p ,
		typeof o=='string' ? (o.substring(0,2)=='_:' ? new rdf.BlankNode(o) : rdf.environment.createNamedNode(o)) : o
	);
}

function generateRefTest(subject, topic, expectedn3, expectedNT, expectedtriples){
	// Setup tests
	var expectedGraph = new rdf.Graph;
	expectedGraph.addAll(expectedtriples);

	// Test interface
	it('('+subject+').ref() methods', function(){
		var t = topic().ref(subject);
		assert.equal(typeof t.n3, 'function');
		assert.equal(typeof t.toNT, 'function');
		assert.equal(typeof t.graphify, 'function');
	});
	it('('+subject+').ref().graphify()', function(){
		var t = topic().ref(subject);
		// test graphify
		var outputGraph = t.graphify();
		// Have the data, compare
		var expectedTriples = expectedGraph.toArray().sort();
		var outputTriples = outputGraph.toArray().sort();
		if(!expectedGraph.equals(outputGraph)){
			assert.equal(outputTriples.join('\n'), expectedTriples.join('\n'));
			assert(expectedGraph.equals(outputGraph));
		}
	});
	it('('+subject+').ref().n3() expected output', function(){
		var t = topic().ref(subject);
		var n3 = t.n3();
		// test n3
		assert.equal(n3, expectedn3);
	});
	it('('+subject+').ref().n3() parse graph', function(){
		var t = topic().ref(subject);
		var n3 = t.n3();
		// Parse the generated n3 as Turtle
		var outputGraph = env.createGraph();
		var parser = new rdf.TurtleParser(t.getProfile());
		parser.parse(n3, undefined, 'http://example.com/', null, outputGraph);
		// Have the data, compare
		var expectedTriples = expectedGraph.toArray().sort();
		var outputTriples = outputGraph.toArray().sort();
		if(!expectedGraph.equals(outputGraph)){
			assert.equal(outputTriples.join('\n'), expectedTriples.join('\n'));
			assert(expectedGraph.equals(outputGraph));
		}
		});
	it('('+subject+').ref().toNT() expected output', function(){
		var t = topic().ref(subject);
		var NT = t.toNT().replace(/_:b\d+/g, '_:bn');
		// test toNT
		assert.equal(NT, expectedNT);
	});
	it('('+subject+').ref().toNT() parsed graph', function(){
		var t = topic().ref(subject);
		var NT = t.toNT();
		// Parse the generated N-Triples
		var outputGraph = env.createGraph();
		var parser = new rdf.TurtleParser;
		parser.parse(NT, undefined, 'http://example.com/', null, outputGraph);
		// Have the data, compare
		var expectedTriples = expectedGraph.toArray().sort();
		var outputTriples = outputGraph.toArray().sort();
		if(!expectedGraph.equals(outputGraph)){
			assert.equal(outputTriples.join('\n'), expectedTriples.join('\n'));
			assert(expectedGraph.equals(outputGraph));
		}
	});
}

describe('Object builtins', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});

	describe('().ref the a keyword', function(){
		generateRefTest('_:topic1',
			function(){
				return {a: 'rdfs:Class'};
			},
			'_:topic1 rdf:type rdfs:Class .',
			'_:topic1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
			[ triple('_:topic1', "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", 'http://www.w3.org/2000/01/rdf-schema#Class')
			]);
	});
	describe('().ref integer', function(){
		generateRefTest('_:integer',
			function(){
				return {rdf$value: 42};
			},
			'_:integer rdf:value 42 .',
			'_:integer <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "42"^^<http://www.w3.org/2001/XMLSchema#integer> .',
			[ triple('_:integer', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', new rdf.Literal('42','http://www.w3.org/2001/XMLSchema#integer'))
			]);
	});
	describe('().ref decimal', function(){
		generateRefTest('_:decimal',
			function(){
				return {rdf$value: 4.4};
			},
			'_:decimal rdf:value 4.4 .',
			'_:decimal <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "4.4"^^<http://www.w3.org/2001/XMLSchema#decimal> .',
			[ triple('_:decimal', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', new rdf.Literal('4.4','http://www.w3.org/2001/XMLSchema#decimal'))
			]);
	});
	describe('(_:topic4).ref string spaces', function(){
		generateRefTest('_:topic4',
			function(){
				return {rdf$value: env.createLiteral("A string 2000.")};
			},
			'_:topic4 rdf:value "A string 2000." .',
			'_:topic4 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "A string 2000." .',
			[ triple('_:topic4', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', new rdf.Literal("A string 2000."))
			]);
	});
	describe('(_:topic5).ref language literal', function(){
		generateRefTest('_:topic5',
			function(){
				return {rdf$value: "The Hobbit".l('en')};
			},
			'_:topic5 rdf:value "The Hobbit"@en .',
			'_:topic5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "The Hobbit"@en .',
			[ triple('_:topic5', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', new rdf.Literal("The Hobbit",'@en'))
			]
		);
	});
	describe('(_:topic6).ref', function(){
		// Normally, use env.createBlankNode
		// For deterministic tests, we use BlankNode with a name
		generateRefTest('_:topic6',
			function(){
				return {rdf$value: new rdf.BlankNode('_:target')};
			},
			'_:topic6 rdf:value _:target .',
			'_:topic6 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> _:target .',
			[ triple('_:topic6', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', '_:target')
			]);
	});
	describe('(_:mval).ref multiple values', function(){
		// Normally, use env.createBlankNode
		// For deterministic tests, we use BlankNode with a name
		generateRefTest('_:topic6',
			function(){
				return {rdf$value: new rdf.BlankNode('_:target')};
			},
			'_:topic6 rdf:value _:target .',
			'_:topic6 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> _:target .',
			[ triple('_:topic6', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', '_:target')
			]);
	});
	describe('(_:topic7).ref objects are unlabeled blank nodes', function(){
		var b1 = new rdf.BlankNode('_:b1');
		var b2 = new rdf.BlankNode('_:target');
		generateRefTest('_:topic7',
			function(){
				return {rdf$value: {rdf$value: '_:target'}};
			},
			'_:topic7 rdf:value [\n\t\trdf:value _:target\n\t\t] .',
			'_:topic7 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> _:bn .\n_:bn <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> _:target .',
			[ triple('_:topic7', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', b1)
			, triple(b1, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', b2)
			]);
	});
	describe('(dbr:Albert_Einstein).ref', function(){
		/*
			dbp:dateOfBirth "1879-03-14"^^xsd:date ; # we only produce xsd:dateTime
			foaf:depiction <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .
		*/
		generateRefTest( 'http://dbpedia.org/resource/Albert_Einstein',
			function(){
				return {
					$context: {
						'dbr': 'http://dbpedia.org/resource/',
						'dbp': 'http://dbpedia.org/property/',
						'foaf': 'http://xmlns.com/foaf/0.1/',
					},
					dbp$dateOfBirth: new Date("1879-03-14"),
					'foaf:depiction': 'http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg',
				};
			},
			'dbr:Albert_Einstein\n\tdbp:dateOfBirth "1879-03-14T00:00:00Z"^^xsd:dateTime;\n\tfoaf:depiction <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .',
			'<http://dbpedia.org/resource/Albert_Einstein> <http://dbpedia.org/property/dateOfBirth> "1879-03-14T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n<http://dbpedia.org/resource/Albert_Einstein> <http://xmlns.com/foaf/0.1/depiction> <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .',
			[ triple("http://dbpedia.org/resource/Albert_Einstein", "http://xmlns.com/foaf/0.1/depiction", 'http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg')
			, triple("http://dbpedia.org/resource/Albert_Einstein", "http://dbpedia.org/property/dateOfBirth", new rdf.Literal("1879-03-14T00:00:00Z",rdf.xsdns('dateTime')))
			]);
	});
});
