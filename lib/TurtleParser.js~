var parsers = exports;

var Triple = require("./RDFNode.js").Triple;
var IRI = require('./RDFNode.js').IRI;
var IndexedGraph = require("./IndexedGraph.js").IndexedGraph;
var RDFEnvironment = require('./RDFEnvironment.js').RDFEnvironment;
var prof = new RDFEnvironment;

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
parsers.Turtle = function(environment) {
	if(!environment) environment=new RDFEnvironment;
	this.environment = environment;
	this.base = new IRI('');
	this.bnHash = {};
	this.filter = null;
	this.processor = null;
	this.quick = null;
	this.graph = null;
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
	parse: function(doc, callback, base, filter, graph) {
		this.graph = graph==null ? new IndexedGraph : graph;
		if(base) this.base = new IRI(base);
		this.filter = filter;
		this.quick = false;
		this.parseStatements(new String(doc));
		if(typeof(callback)=="function") cb(this.graph);			
		return true;
	},
	process: function(doc, processor, filter) {
		this.processor = processor;
		if(base) this.base = new IRI(base);
		this.filter = filter;
		this.quick = true;
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
		t.o = this.environment.createBlankNode();
		s = this.skipWS(s.slice(1));
		if(s.charAt(0) == "]") { return s.slice(1) }
		s = this.skipWS(this.consumePredicateObjectList(s, t));
		this.expect(s, "]");
		return this.skipWS(s.slice(1))
	},
	consumeCollection: function(s, subject) {
		subject.o = this.environment.createBlankNode();
		var listject = this.t();
		listject.o = subject.o;
		s = this.skipWS(s.slice(1));
		var cont = s.charAt(0) != ")";
		if(!cont) { subject.o = prof.resolve("rdf:nil") }
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
						o.o = this.environment.resolve(token);
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
			this.add(new Triple(listject.o, prof.resolve("rdf:first"), o.o));
			s = this.skipWS(s);
			cont = s.charAt(0) != ")";
			if(cont) {
				this.add(new Triple(listject.o, prof.resolve("rdf:rest"), listject.o = this.environment.createBlankNode()))
			} else {
				this.add(new Triple(listject.o, prof.resolve("rdf:rest"), prof.resolve("rdf:nil")))
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
			this.environment.setPrefix(prefix, this.base.resolveReference(parsers.decodeString(s.substring(1, p = s.indexOf(">")))).value);
			s = this.skipWS(s.slice(++p))
		} else if(s.substring(1, 5) == "base") {
			s = this.skipWS(s.slice(5));
			this.expect(s, "<");
			this.base = this.base.resolveReference(parsers.decodeString(s.substring(1, p = s.indexOf(">"))));
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
				o.o = this.environment.createLiteral(value, token.slice(1), null);
				s = s.slice(token.length);
				break;
			case "^":
				var token = s.match(parsers.Turtle.simpleObjectToken).shift().slice(2);
				if(token.charAt(0) == "<") {
					o.o = this.environment.createLiteral(value, null, token.substring(1, token.length - 1));
				} else {
					o.o = this.environment.createLiteral(value, null, token);
				}
				s = s.slice(token.length + 2);
				break;
			default:
				o.o = this.environment.createLiteral(value, null, null);
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
						o.o = this.environment.createLiteral(token, null, "xsd:boolean");
					} else if(token.indexOf(":") > -1) {
						o.o = this.environment.resolve(token);
						if(!o.o) throw new Error('Prefix not defined for '+token);
					} else if(parsers.Turtle.tokenInteger.test(token)) {
						o.o = this.environment.createLiteral(token, null, "xsd:integer");
					} else if(parsers.Turtle.tokenDouble.test(token)) {
						o.o = this.environment.createLiteral(token, null, "xsd:double");
					} else if(parsers.Turtle.tokenDecimal.test(token)) {
						o.o = this.environment.createLiteral(token, null, "xsd:decimal");
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
				property = prof.resolve("rdf:type")
			} else {
				switch(predicate.charAt(0)) {
					case "<": property = this.base.resolveReference(parsers.decodeString(predicate.substring(1, predicate.indexOf(">")))).value; break;
					default: property = this.environment.resolve(predicate); break
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
		t.o = this.environment.resolve(qname);
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
		t.o = this.base.resolveReference(parsers.decodeString(s.substring(1, p=s.indexOf(">")))).value;
		return s.slice(++p)
	},
	expect: function(s, t) {
		if(s.substring(0, t.length) == t) { return }
		throw new Error("Expected token: " + t + " at " + s.substring(0, 50));
	},
	getBlankNode: function(id) {
		if(this.bnHash[id]) return this.bnHash[id];
		return this.bnHash[id]=this.environment.createBlankNode();
	},	 
	skipWS: function(s) {
		while(parsers.Turtle.isWhitespace.test(s.charAt(0))) {
			s = s.replace(parsers.Turtle.initialWhitespace, "");
			if(s.charAt(0) == "#") { s = s.replace(parsers.Turtle.initialComment, "") }
		}
		return s
	}
};
