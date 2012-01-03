var parsers = exports;
var IRI = require('./RDFNode.js').IRI;
var BlankNode = require("./RDFNode.js").BlankNode;
var Literal = require("./RDFNode.js").Literal;
var Triple = require("./RDFNode.js").Triple;
var IndexedGraph = require("./IndexedGraph.js").IndexedGraph;

parsers.u8 = new RegExp("\\\\U([A-F0-9]{8})", "g");
parsers.u4 = new RegExp("\\\\u([A-F0-9]{4})", "g");
parsers.hexToChar = function(hex) {
	var result = "";
	var n = parseInt(hex, 16);
	if(n <= 65535) {
		result += String.fromCharCode(n)
	} else if(n <= 1114111) {
		n -= 65536;
		result += String.fromCharCode(55296 + (n >> 10), 56320 + (n & 1023))
	} else {
		throw new Error("code point isn't known: " + n);
	}
	return result
};
parsers.decodeString = function(str) {
	str = str.replace(parsers.u8, function(matchstr, parens) { return parsers.hexToChar(parens) });
	str = str.replace(parsers.u4, function(matchstr, parens) { return parsers.hexToChar(parens) });
	str = str.replace(new RegExp("\\\\t", "g"), "\t");
	str = str.replace(new RegExp("\\\\n", "g"), "\n");
	str = str.replace(new RegExp("\\\\r", "g"), "\r");
	str = str.replace(new RegExp('\\\\"', "g"), '"');
	str = str.replace(new RegExp("\\\\\\\\", "g"), "\\");
	return str
};

/**
 * Turtle implements DataParser
 * doc param of parse() and process() must be a string
 */
parsers.Turtle = function(context) {
	this.context = context;
	this.bnHash = {};
};
parsers.Turtle.isWhitespace = new RegExp("^[ \t\r\n#]+", "");
parsers.Turtle.initialWhitespace = new RegExp("^[ \t\r\n]+", "");
parsers.Turtle.initialComment = new RegExp("^#[^\r\n]*", "");
parsers.Turtle.simpleToken = new RegExp("^[^ \t\r\n]+", "");
parsers.Turtle.simpleObjectToken = new RegExp("^[^ \t\r\n;,]+", "");
parsers.Turtle.tokenInteger = new RegExp("^(-|\\+)?[0-9]+$", "");
parsers.Turtle.tokenDouble = new RegExp("^(-|\\+)?(([0-9]+\\.[0-9]*[eE]{1}(-|\\+)?[0-9]+)|(\\.[0-9]+[eE]{1}(-|\\+)?[0-9]+)|([0-9]+[eE]{1}(-|\\+)?[0-9]+))$", "");
parsers.Turtle.tokenDecimal = new RegExp("^(-|\\+)?[0-9]*\\.[0-9]+?$", "");	
parsers.Turtle.prototype = {
	bnHash: null, context: null, filter: null, processor: null, quick: null, graph: null,
	parse: function(doc, callback, filter, graph) {
		this.graph = graph==null ? new IndexedGraph : graph;
		this.filter = filter;
		this.quick = false;
		this.parseStatements(new String(doc));
		if(typeof(callback)=="function") cb(this.graph);			
		return true;
	},
	process: function(doc, processor, filter) {
		this.processor = processor; this.filter = filter; this.quick = true;
		return this.parseStatements(new String(doc))
	},
	t: function() { return{o:null} },
	parseStatements: function(s) {
		s = s.toString();
		while(s.length > 0) {
			s = this.skipWS(s);
			if(s.length == 0) return true;
			s.charAt(0) == "@" ? s = this.consumeDirective(s) : s = this.consumeStatement(s);
			this.expect(s, ".");
			s = this.skipWS(s.slice(1))
		}
		return true
	},
	add: function(t) {
		var $use = true;
		if(this.filter != null) {	$use = this.filter(t, null, null) }
		if(!$use) { return }
		this.quick ? this.processor(t) : this.graph.add(t);
	},
	consumeBlankNode: function(s, t) {
		t.o = new BlankNode;
		s = this.skipWS(s.slice(1));
		if(s.charAt(0) == "]") { return s.slice(1) }
		s = this.skipWS(this.consumePredicateObjectList(s, t));
		this.expect(s, "]");
		return this.skipWS(s.slice(1))
	},
	consumeCollection: function(s, subject) {
		subject.o = new BlankNode;
		var listject = this.t();
		listject.o = subject.o;
		s = this.skipWS(s.slice(1));
		var cont = s.charAt(0) != ")";
		if(!cont) { subject.o = this.context.resolve("rdf:nil") }
		while(cont) {
			var o = this.t();
			switch(s.charAt(0)) {
				case "[": s = this.consumeBlankNode(s, o); break;
				case "_": s = this.consumeKnownBlankNode(s, o); break;
				case "(": s = this.consumeCollection(s, o); break;
				case "<": s = this.consumeURI(s, o); break;
				case '"': s = this.consumeLiteral(s, o); break;
				default:
					var token = s.match(parsers.Turtle.simpleObjectToken).shift();
					if(token.charAt(token.length - 1) == ")") { token = token.substring(0, token.length - 1) }
					if(token == "false" || token == "true") {
						o.o = token.tl("xsd:boolean")
					} else if(token.indexOf(":") > -1) {
						o.o = this.context.resolve(token);
					} else if(parsers.Turtle.tokenInteger.test(token)) {
						o.o = token.tl("xsd:integer");
					} else if(parsers.Turtle.tokenDouble.test(token)) {
						o.o = token.tl("xsd:double");
					} else if(parsers.Turtle.tokenDecimal.test(token)) {
						o.o = token.tl("xsd:decimal");
					} else {
						throw new Error("unrecognised token: " + token);
					}
					s = s.slice(token.length);
					break
			}
			this.add(new Triple(listject.o, this.context.resolve("rdf:first"), o.o));
			s = this.skipWS(s);
			cont = s.charAt(0) != ")";
			if(cont) {
				this.add(new Triple(listject.o, this.context.resolve("rdf:rest"), listject.o = new BlankNode))
			} else {
				this.add(new Triple(listject.o, this.context.resolve("rdf:rest"), this.context.resolve("rdf:nil")))
			}
		}
		return this.skipWS(s.slice(1))
	},
	consumeDirective: function(s) {
		var p = 0;
		if(s.substring(1, 7) == "prefix") {
			s = this.skipWS(s.slice(7));
			p = s.indexOf(":");
			var prefix = s.substring(0, p);
			s = this.skipWS(s.slice(++p));
			this.expect(s, "<");
			this.context.setPrefix(prefix, parsers.decodeString(s.substring(1, p = s.indexOf(">"))));
			s = this.skipWS(s.slice(++p))
		} else if(s.substring(1, 5) == "base") {
			s = this.skipWS(s.slice(5));
			this.expect(s, "<");
			this.context.base = new IRI(parsers.decodeString(s.substring(1, p = s.indexOf(">"))));
			s = this.skipWS(s.slice(++p))
		} else {
			throw new Error("Unknown directive: " + s.substring(0, 50));
		}
		return s
	},
	consumeKnownBlankNode: function(s, t) {
		this.expect(s, "_:");
		var bname = s.slice(2).match(parsers.Turtle.simpleToken).shift();
		t.o = this.getBlankNode(bname);
		return s.slice(bname.length + 2)
	},
	consumeLiteral: function(s, o) {
		var value = "";
		var hunt = true;
		var end = 0;
		if(s.substring(0, 3) == '"""') {
			end = 3;
			while(hunt) {
				end = s.indexOf('"""', end);
				if(hunt = s.charAt(end - 1) == "\\") { end++ }
			}
			value = s.substring(3, end);
			s = s.slice(value.length + 6)
		} else {
			while(hunt) {
				end = s.indexOf('"', end + 1);
				hunt = s.charAt(end - 1) == "\\"
			}
			value = s.substring(1, end);
			s = s.slice(value.length + 2)
		}
		value = parsers.decodeString(value);
		switch(s.charAt(0)) {
			case "@":
				var token = s.match(parsers.Turtle.simpleObjectToken).shift();
				o.o = new Literal(value, token.slice(1));
				s = s.slice(token.length);
				break;
			case "^":
				var token = s.match(parsers.Turtle.simpleObjectToken).shift().slice(2);
				if(token.charAt(0) == "<") {
					o.o = value.tl(token.substring(1, token.length - 1));
				} else {
					o.o = value.tl(token);
				}
				s = s.slice(token.length + 2);
				break;
			default:
				o.o = new Literal(value);
				break
		}
		return s
	},
	consumeObjectList: function(s, subject, property) {
		var cont = true;
		while(cont) {
			var o = this.t();
			switch(s.charAt(0)) {
				case "[": s = this.consumeBlankNode(s, o); break;
				case "_": s = this.consumeKnownBlankNode(s, o); break;
				case "(": s = this.consumeCollection(s, o); break;
				case "<": s = this.consumeURI(s, o); break;
				case '"': s = this.consumeLiteral(s, o); break;
				default:
					var token = s.match(parsers.Turtle.simpleObjectToken).shift();
					if(token.charAt(token.length - 1) == ".") {
						token = token.substring(0, token.length - 1)
					}
					if(token == "false" || token == "true") {
						o.o = token.tl("xsd:boolean");
					} else if(token.indexOf(":") > -1) {
						o.o = this.context.resolve(token)
					} else if(parsers.Turtle.tokenInteger.test(token)) {
						o.o = token.tl("xsd:integer");
					} else if(parsers.Turtle.tokenDouble.test(token)) {
						o.o = token.tl("xsd:double");
					} else if(parsers.Turtle.tokenDecimal.test(token)) {
						o.o = token.tl("xsd:decimal");
					} else {
						throw new Error("unrecognised token: " + token);
					}
					s = s.slice(token.length);
					break
			}
			this.add(new Triple(subject.o, property, o.o));
			s = this.skipWS(s);
			cont = s.charAt(0) == ",";
			if(cont) { s = this.skipWS(s.slice(1)) }
		}
		return s
	},
	consumePredicateObjectList: function(s, subject) {
		var cont = true;
		while(cont) {
			var predicate = s.match(parsers.Turtle.simpleToken).shift();
			var property = null;
			if(predicate == "a") {
				property = this.context.resolve("rdf:type")
			} else {
				switch(predicate.charAt(0)) {
					case "<": property = new IRI(parsers.decodeString(predicate.substring(1, predicate.indexOf(">")))); break;
					default: property = this.context.resolve(predicate); break
				}
			}
			s = this.skipWS(s.slice(predicate.length));
			s = this.consumeObjectList(s, subject, property);
			cont = s.charAt(0) == ";";
			if(cont) { s = this.skipWS(s.slice(1)) }
		}
		return s
	},
	consumeQName: function(s, t) {
		var qname = s.match(parsers.Turtle.simpleToken).shift();
		t.o = this.context.resolve(qname);
		return s.slice(qname.length)
	},
	consumeStatement: function(s) {
		var t = this.t();
		switch(s.charAt(0)) {
			case "[":
				s = this.consumeBlankNode(s, t);
				if(s.charAt(0) == ".") { return s }
				break;
			case "_": s = this.consumeKnownBlankNode(s, t); break;
			case "(": s = this.consumeCollection(s, t); break;
			case "<": s = this.consumeURI(s, t); break;
			default: s = this.consumeQName(s, t); break
		}
		s = this.consumePredicateObjectList(this.skipWS(s), t);
		return s
	},
	consumeURI: function(s, t) {
		this.expect(s, "<");
		var p = 0;
		t.o = new IRI(parsers.decodeString(s.substring(1, p = s.indexOf(">"))));
		return s.slice(++p)
	},
	expect: function(s, t) {
		if(s.substring(0, t.length) == t) { return }
		throw new Error("Expected token: " + t + " at " + s.substring(0, 50));
	},
	getBlankNode: function(id) {
		if(this.bnHash[id]) return this.bnHash[id];
		return this.bnHash[id]=new BlankNode;
	},	 
	skipWS: function(s) {
		while(parsers.Turtle.isWhitespace.test(s.charAt(0))) {
			s = s.replace(parsers.Turtle.initialWhitespace, "");
			if(s.charAt(0) == "#") { s = s.replace(parsers.Turtle.initialComment, "") }
		}
		return s
	}
};
