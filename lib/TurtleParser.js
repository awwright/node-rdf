"use strict";

var parsers = exports;

var IRI = require('iri').IRI;
var env = require('./environment.js').environment;
function rdfns(v){return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'+v;}
function xsdns(v){return 'http://www.w3.org/2001/XMLSchema#'+v;}

parsers.u8 = new RegExp("\\\\U([0-9A-Fa-f]{8})", "g");
parsers.u4 = new RegExp("\\\\u([0-9A-Fa-f]{4})", "g");
parsers.hexToChar = function hexToChar(hex) {
	var result = "";
	var n = parseInt(hex, 16);
	if(n <= 65535) {
		result += String.fromCharCode(n);
	} else if(n <= 1114111) {
		n -= 65536;
		result += String.fromCharCode(55296 + (n >> 10), 56320 + (n & 1023));
	} else {
		throw new Error("code point isn't known: " + n);
	}
	return result;
};
parsers.decodeString = function decodeString(str) {
	str = str.replace(parsers.u8, function(matchstr, parens) { return parsers.hexToChar(parens); });
	str = str.replace(parsers.u4, function(matchstr, parens) { return parsers.hexToChar(parens); });
	str = str.replace(new RegExp("\\\\t", "g"), "\t");
	str = str.replace(new RegExp("\\\\b", "g"), "\b");
	str = str.replace(new RegExp("\\\\n", "g"), "\n");
	str = str.replace(new RegExp("\\\\r", "g"), "\r");
	str = str.replace(new RegExp("\\\\f", "g"), "\f");
	str = str.replace(new RegExp('\\\\"', "g"), '"');
	str = str.replace(new RegExp("\\\\\\\\", "g"), "\\");
	return str;
};
parsers.decodePrefixedName = function(str){
	var decoded = '';
	for(var i=0; i<str.length; i++){
		if(str[i]=='\\'){
			decoded += str[++i];
		}else{
			decoded += str[i];
		}
	}
	return decoded;
};
parsers.decodeIRIREF = function decodeIRIREF(str) {
	str = str.replace(parsers.u8, function(matchstr, parens) { return parsers.hexToChar(parens); });
	str = str.replace(parsers.u4, function(matchstr, parens) { return parsers.hexToChar(parens); });
	return str;
};

/**
 * Turtle implements DataParser
 * doc param of parse() and process() must be a string
 */
function Turtle(environment) {
	if(!environment) environment = env.createProfile();
	this.environment = environment;
	this.base = new IRI('');
	this.bnHash = {};
	this.filter = null;
	this.processor = null;
	this.quick = null;
	this.graph = null;
}
parsers.Turtle = Turtle;

Turtle.parse = function parse(document, base, event){
	var parser = new Turtle();
	if(typeof event=='function'){
		parser.quick = true;
		parser.processor = event;
	}
	parser.parse(document, null, base);
	if(typeof event=='function'){
		event(null, null);
	}
	return parser;
};

Turtle.isWhitespace = new RegExp("^[ \t\r\n#]+", "");
Turtle.initialWhitespace = new RegExp("^[ \t\r\n]+", "");
Turtle.initialComment = new RegExp("^#[^\r\n]*", "");
Turtle.simpleToken = new RegExp("^[^ \t\r\n](\\.*[^ \t\r\n,;\\.])*", "");
Turtle.simpleObjectToken = /^(\\[_\~\.\-\!\$&'()*+,;=\/?#@%]|%[0-9A-Fa-f]{2}|[^ \t\r\n;,\[\]()])+/;
Turtle.tokenInteger = new RegExp("^(-|\\+)?[0-9]+", "");
Turtle.tokenDouble = new RegExp("^(-|\\+)?(([0-9]+\\.[0-9]*[eE]{1}(-|\\+)?[0-9]+)|(\\.[0-9]+[eE]{1}(-|\\+)?[0-9]+)|([0-9]+[eE]{1}(-|\\+)?[0-9]+))", "");
Turtle.tokenDecimal = new RegExp("^(-|\\+)?[0-9]*\\.[0-9]+?", "");
Turtle.PrefixedName = /^(([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD](([\-.0-9A-Z_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD])*[\-0-9A-Z_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD])?)?:([A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD]|[0-9:]|%[0-9A-Fa-f][0-9A-Fa-f]|\\[!#$%&'()*+,\-.\/;=?@_~])((([\-0-9A-Z_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD]|[.0-9:]|%[0-9A-Fa-f][0-9A-Fa-f]|\\[!#$%&'()*+,\-.\/;=?@_~]))*([\-0-9A-Z_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD]|[0-9:]|%[0-9A-Fa-f][0-9A-Fa-f]|\\[!#$%&'()*+,\-.\/;=?@_~]))?|([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD](([\-.0-9A-Z_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD])*[\-0-9A-Z_a-z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uD800-\uDFFF\uF900-\uFDCF\uFDF0-\uFFFD])?)?:)/;

Turtle.prototype.parse = function parse(doc, callback, base, filter, graph) {
	this.graph = graph==null ? env.createGraph() : graph;
	if(base) this.base = new IRI(base.toString());
	this.filter = filter;
	this.parseStatements(new String(doc));
	if((typeof callback)=="function") callback(this.graph);
	return true;
};
Turtle.prototype.t = function t(){ return {o:null}; };
Turtle.prototype.expect = function(s, t) {
	if(typeof t.test=='function'){
		if(t.test(s)) return;
	}else if(typeof t=='string'){
		if(s.substring(0, t.length) == t) return;
	}
	throw new Error("Expected token: " + t + " at " + JSON.stringify(s.substring(0, 50)));
};
Turtle.prototype.parseStatements = function(s) {
	s = s.toString();
	while(s.length > 0) {
		s = this.skipWS(s);
		if(s.length == 0) return true;
		s = (s.charAt(0)=="@" || s.substring(0,4).toUpperCase()=='BASE' || s.substring(0,6).toUpperCase()=='PREFIX') ? this.consumeDirective(s) : this.consumeStatement(s);
		s = this.skipWS(s);
	}
	return true;
};
Turtle.prototype.createTriple = function createTriple(s, p, o){
	return env.createTriple(s, p, o);
};
Turtle.prototype.createNamedNode = function createNamedNode(v){
	return env.createNamedNode(v);
};
Turtle.prototype.createBlankNode = function createBlankNode(){
	return env.createBlankNode();
};
Turtle.prototype.createLiteral = function createLiteral(v, l, t){
	return env.createLiteral(v, l, t);
};
Turtle.prototype.add = function(t) {
	var $use = true;
	if(this.filter != null) $use = this.filter(t, null, null);
	if(!$use) return;
	this.processor ? this.processor(null, t) : this.graph.add(t);
};
Turtle.prototype.consumeBlankNode = function(s, t) {
	t.o = this.createBlankNode();
	s = this.skipWS(s.slice(1));
	if(s.charAt(0) == "]") return s.slice(1);
	s = this.skipWS(this.consumePredicateObjectList(s, t));
	this.expect(s, "]");
	return this.skipWS(s.slice(1));
};
Turtle.prototype.consumeCollection = function(s, subject) {
	subject.o = this.createBlankNode();
	var listject = this.t();
	listject.o = subject.o;
	s = this.skipWS(s.slice(1));
	var cont = s.charAt(0) != ")";
	if(!cont) { subject.o = this.createNamedNode(rdfns("nil")); }
	while(cont) {
		var o = this.t();
		switch(s.charAt(0)) {
			case "[": s = this.consumeBlankNode(s, o); break;
			case "_": s = this.consumeKnownBlankNode(s, o); break;
			case "(": s = this.consumeCollection(s, o); break;
			case "<": s = this.consumeURI(s, o); break;
			case '"': case "'": s = this.consumeLiteral(s, o); break;
			case '+': case '-': case '.':
			case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
				var token;
				if(token = Turtle.tokenDouble.exec(s)){
					token = token[0];
					o.o = this.createLiteral(token, null, xsdns("double"));
				} else if(token = Turtle.tokenDecimal.exec(s)){
					token = token[0];
					o.o = this.createLiteral(token, null, xsdns("decimal"));
				} else if(token = Turtle.tokenInteger.exec(s)){
					token = token[0];
					o.o = this.createLiteral(token, null, xsdns("integer"));
				} else {
					throw new Error("Expected NumericLiteral");
				}
				s = s.slice(token.length);
				break;
			default:
				var token = s.match(Turtle.simpleObjectToken).shift();
				if(token.charAt(token.length - 1) == ")") {
					token = token.substring(0, token.length - 1);
				}
				if(token==="false" || token==="true"){
					o.o = this.createLiteral(token, null, xsdns("boolean"));
				}else if(token.indexOf(":") >= 0) {
					o.o = this.createNamedNode(this.environment.resolve(token));
				}
				s = s.slice(token.length);
				break;
		}
		this.add(this.createTriple(listject.o, this.createNamedNode(rdfns("first")), o.o));
		s = this.skipWS(s);
		cont = s.charAt(0) != ")";
		if(cont) {
			this.add(this.createTriple(listject.o, this.createNamedNode(rdfns("rest")), listject.o = this.createBlankNode()));
		} else {
			this.add(this.createTriple(listject.o, this.createNamedNode(rdfns("rest")), this.createNamedNode(rdfns("nil"))));
		}
	}
	return this.skipWS(s.slice(1));
};
Turtle.prototype.consumeDirective = function(s) {
	var p = 0;
	if(s.substring(1, 7) == "prefix") {
		s = this.skipWS(s.slice(7));
		p = s.indexOf(":");
		var prefix = s.substring(0, p);
		s = this.skipWS(s.slice(++p));
		this.expect(s, "<");
		this.environment.setPrefix(prefix, this.base.resolveReference(parsers.decodeIRIREF(s.substring(1, p = s.indexOf(">")))).toString());
		s = this.skipWS(s.slice(++p));
		this.expect(s, ".");
		s = s.slice(1);
	} else if(s.substring(0, 6).toUpperCase() == "PREFIX") {
		// SPARQL-style
		s = this.skipWS(s.slice(7));
		p = s.indexOf(":");
		var prefix = s.substring(0, p);
		s = this.skipWS(s.slice(++p));
		this.expect(s, "<");
		this.environment.setPrefix(prefix, this.base.resolveReference(parsers.decodeIRIREF(s.substring(1, p = s.indexOf(">")))).toString());
		s = this.skipWS(s.slice(++p));
	} else if(s.substring(1, 5) == "base") {
		s = this.skipWS(s.slice(5));
		this.expect(s, "<");
		this.base = this.base.resolveReference(parsers.decodeIRIREF(s.substring(1, p = s.indexOf(">"))));
		s = this.skipWS(s.slice(++p));
		this.expect(s, ".");
		s = s.slice(1);
	} else if(s.substring(0, 4).toUpperCase() == "BASE") {
		// SPARQL-style
		s = this.skipWS(s.slice(5));
		this.expect(s, "<");
		this.base = this.base.resolveReference(parsers.decodeIRIREF(s.substring(1, p = s.indexOf(">"))));
		s = this.skipWS(s.slice(++p));
	} else {
		throw new Error("Unknown directive: " + s.substring(0, 50));
	}
	return s;
};
Turtle.prototype.consumeKnownBlankNode = function(s, t) {
	this.expect(s, "_:");
	var bname = s.slice(2).match(Turtle.simpleToken).shift();
	t.o = this.getBlankNode(bname);
	return s.slice(bname.length + 2);
};
Turtle.prototype.consumeLiteral = function(s, o) {
	var char = s[0];
	var value = "";
	var end = 0;
	var longchar = char+char+char;
	if(s.substring(0, 3) == longchar) {
		for(end=3; end<s.length; end++){
			if(s[end]=='\\') end++;
			else if(s[end]==char && s[end+1]==char && s[end+2]==char) break;
		}
		value = s.substring(3, end);
		s = s.slice(value.length + 6);
	} else {
		for(end=1; end<s.length; end++){
			if(s[end]=='\\') end++;
			else if(s[end]==char) break;
		}
		value = s.substring(1, end);
		s = s.slice(value.length + 2);
	}
	value = parsers.decodeString(value);
	switch(s.charAt(0)) {
		case "@":
			var langtag = s.match(Turtle.simpleObjectToken).shift();
			o.o = this.createLiteral(value, langtag.slice(1), null);
			s = s.slice(langtag.length);
			break;
		case "^":
			this.expect(s, "^^");
			s = s.substring(2);
			var iri_val;
			if(s.charAt(0) == "<"){
				var iri_end = s.indexOf(">");
				if(iri_end<0) throw new Error('Could not find terminating ">"');
				var iri_esc = s.substring(1, iri_end);
				iri_val = this.createNamedNode(this.base.resolveReference(parsers.decodeIRIREF(iri_esc)).toString());
				s = this.skipWS(s.substring(iri_end+1));
			}else{
				var prefixedName = Turtle.PrefixedName.exec(s);
				if(!prefixedName) throw new Error('Expected PrefixedName');
				prefixedName = prefixedName[0];
				iri_val = this.environment.resolve(parsers.decodePrefixedName(prefixedName));
				if(!iri_val) throw new Error('Could not resolve PrefixedName '+JSON.stringify(parsers.decodePrefixedName(prefixedName)));
				s = this.skipWS(s.slice(prefixedName.length));
			}
			o.o = this.createLiteral(value, null, iri_val);
			break;
		default:
			o.o = this.createLiteral(value, null, null);
			break;
	}
	return s;
};
Turtle.prototype.consumeObjectList = function(s, subject, property) {
	var cont = true;
	while(cont) {
		var o = this.t();
		switch(s.charAt(0)) {
			case "[": s = this.consumeBlankNode(s, o); break;
			case "_": s = this.consumeKnownBlankNode(s, o); break;
			case "(": s = this.consumeCollection(s, o); break;
			case "<": s = this.consumeURI(s, o); break;
			case '"': case "'": s = this.consumeLiteral(s, o); break;
			case '+': case '-': case '.':
			case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
				var token;
				if(token = Turtle.tokenDouble.exec(s)){
					token = token[0];
					o.o = this.createLiteral(token, null, xsdns("double"));
				} else if(token = Turtle.tokenDecimal.exec(s)){
					token = token[0];
					o.o = this.createLiteral(token, null, xsdns("decimal"));
				} else if(token = Turtle.tokenInteger.exec(s)){
					token = token[0];
					o.o = this.createLiteral(token, null, xsdns("integer"));
				} else {
					throw new Error("Expected NumericLiteral");
				}
				s = s.slice(token.length);
				break;
			default:
				var token = s.match(Turtle.simpleObjectToken);
				var prefixedName;
				token = token&&token[0] || "";
				if(token.charAt(token.length - 1) == ".") {
					token = token.substring(0, token.length - 1);
				}
				if(token==="true" || token==="false"){
					o.o = this.createLiteral(token, null, xsdns("boolean"));
					s = s.slice(token.length);
				}else if(prefixedName=Turtle.PrefixedName.exec(token)) {
					var prefixedName = prefixedName[0];
					var iri = this.environment.resolve(parsers.decodePrefixedName(prefixedName));
					if(!iri) throw new Error('Could not resolve PrefixedName '+JSON.stringify(parsers.decodePrefixedName(prefixedName)));
					o.o = this.createNamedNode(iri);
					if(!o.o) throw new Error('Prefix not defined for '+token);
					s = s.slice(prefixedName.length);
				} else {
					throw new Error("Unrecognized token in ObjectList: " + token);
				}
				break;
		}
		s = this.skipWS(s);
		this.add(this.createTriple(subject.o, property, o.o));
		cont = s.charAt(0)==",";
		if(cont) { s = this.skipWS(s.slice(1)); }
	}
	return s;
};
Turtle.prototype.consumePredicateObjectList = function(s, subject) {
	var cont = true;
	while(cont) {
		var predicate = s.match(Turtle.PrefixedName);
		if(predicate){
			predicate = predicate.shift();
			var iri = this.environment.resolve(parsers.decodePrefixedName(predicate));
			if(!iri) throw new Error('Could not resolve PrefixedName '+JSON.stringify(parsers.decodePrefixedName(predicate)));
			property = this.createNamedNode(iri);
			s = this.skipWS(s.slice(predicate.length));
			s = this.consumeObjectList(s, subject, property);
			continue;
		}
		switch(s.charAt(0)) {
			case "a":
				var property = this.createNamedNode(rdfns("type"));
				s = this.skipWS(s.substring(1));
				break;
			case "<":
				var iri_end = s.indexOf(">");
				var iri = s.substring(1, iri_end);
				property = this.createNamedNode(this.base.resolveReference(parsers.decodeIRIREF(iri)).toString());
				s = this.skipWS(s.substring(iri_end+1));
				break;
			case "]": return s;
			case ".": return s;
			case ";":
				// empty predicate, skip
				s = this.skipWS(s.substring(1));
				continue;
			default:
				throw new Error('Expected PrefixedName');
		}
		s = this.consumeObjectList(s, subject, property);
		cont = s.charAt(0)==";";
		if(cont) { s = this.skipWS(s.slice(1)); }
	}
	return s;
};
Turtle.prototype.consumePrefixedName = function(s, t) {
	var name = s.match(Turtle.PrefixedName).shift();
	var iri = this.environment.resolve(parsers.decodePrefixedName(name));
	if(!iri) throw new Error('Could not resolve '+JSON.stringify(parsers.decodePrefixedName(name)));
	t.o = this.createNamedNode(iri);
	return s.slice(name.length);
};
Turtle.prototype.consumeStatement = function(s) {
	var t = this.t();
	switch(s.charAt(0)) {
		case "[":
			s = this.consumeBlankNode(s, t);
			if(s.charAt(0) == ".") return s.slice(1);
			break;
		case "_": s = this.consumeKnownBlankNode(s, t); break;
		case "(": s = this.consumeCollection(s, t); break;
		case "<": s = this.consumeURI(s, t); break;
		default: s = this.consumePrefixedName(s, t); break;
	}
	s = this.consumePredicateObjectList(this.skipWS(s), t);
	this.expect(s, ".");
	return s.slice(1);
};
Turtle.prototype.consumeURI = function(s, t) {
	this.expect(s, "<");
	var p = 0;
	t.o = this.createNamedNode(this.base.resolveReference(parsers.decodeIRIREF(s.substring(1, p=s.indexOf(">")))).toString());
	return s.slice(++p);
};
Turtle.prototype.getBlankNode = function(id) {
	if(this.bnHash[id]) return this.bnHash[id];
	return this.bnHash[id]=this.createBlankNode();
};
Turtle.prototype.skipWS = function(s) {
	while(Turtle.isWhitespace.test(s.charAt(0))) {
		s = s.replace(Turtle.initialWhitespace, "");
		if(s.charAt(0) == "#") {
			s = s.replace(Turtle.initialComment, "");
		}
	}
	return s;
};
