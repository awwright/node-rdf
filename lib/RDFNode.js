"use strict";

var encodeString = require('./encodeString.js');
var api = exports;

function inherits(ctor, superCtor) {
	//ctor.super_ = superCtor;
	ctor.prototype = Object.create(superCtor.prototype, {
		constructor: { value: ctor, enumerable: false },
	});
}

function nodeType(v){
	if(v.nodeType) return v.nodeType();
	if(typeof v=='string') return (v.substr(0,2)=='_:')?'BlankNode':'IRI';
	return 'TypedLiteral';
}
api.nodeType = nodeType;

function RDFNodeEquals(other) {
	if(typeof other=='string'){
		return this.termType=="NamedNode" && this.value==other;
	}
	if(api.RDFNode.is(other)){
		if(nodeType(this)!=nodeType(other)) return false;
		switch(this.termType) {
			case "BlankNode":
			case "NamedNode":
			case "Variable":
			case "DefaultGraph":
				return this.toString()==other.toString();
			case "Literal":
				return ( this.language==other.language
					&& this.nominalValue==other.nominalValue
					&& this.datatype.toString()==other.datatype.toString()
				);
		}
		if(typeof this.toNT=='function' && typeof other.toNT=='function'){
			return this.toNT() == other.toNT();
		}
	}
	//throw new Error('Cannot compare values');
	return false;
}
api.RDFNodeEquals = RDFNodeEquals;

function RDFNodeCompare(other) {
	// Node type order: IRI, BlankNode, Literal
	var typeThis=this.termType, typeOther=other.termType;
	if(typeThis != typeOther){
		switch(typeThis) {
			case "IRI":
			case "NamedNode":
				// must be a BlankNode or Literal
				return -1;
			case "BlankNode":
				if(typeOther=="Literal") return -1;
				else return 1;
			case "Literal":
				return 1;
		}
		throw new Error(typeThis);
	}
	// node types are the same, compare nomialValue
	if(typeof this.nominalValue=='string' && typeof other.nominalValue=='string'){
		if(this.nominalValue < other.nominalValue) return -1;
		if(this.nominalValue > other.nominalValue) return 1;
	}
	// values are the same, compare by datatype
	if(typeof this.datatype=='string' && typeof other.datatype=='string'){
		if(this.datatype < other.datatype) return -1;
		if(this.datatype > other.datatype) return 1;
	}
	if(typeof this.language=='string' || typeof other.language=='string'){
		if(typeof this.language=='string' && typeof other.language=='string'){
			if(this.language < other.language) return -1;
			if(this.language > other.language) return 1;
		}else{
			if(other.language) return -1;
			if(this.language) return 1;
		}
	}
	// Compare by any other metric?
	if(typeof this.valueOf=='function'){
		if(this.valueOf() < other) return -1;
		if(this.valueOf() > other) return 1;
		//if(this.valueOf() == other) return 0;
	}
	if(this.equals(other)) return 0;
	throw new Error('Cannot compare values');
}
api.RDFNodeEquals = RDFNodeEquals;

/**
* Implements Triple http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Triple
*/
api.Triple = function Triple(s, p, o) {
	if(typeof s=='string') s = new NamedNode(s);
	if(!api.RDFNode.is(s)) throw new Error('Triple subject is not an RDFNode');
	if(s.termType!=='NamedNode' && s.termType!=='BlankNode') throw new Error('subject must be a NamedNode/BlankNode');

	if(typeof p=='string') p = new NamedNode(p);
	if(!api.RDFNode.is(p)) throw new Error('Triple predicate is not an RDFNode');
	if(p.termType!=='NamedNode') throw new Error('predicate must be a NamedNode');

	if(typeof o=='string') o = new NamedNode(o);
	if(!api.RDFNode.is(o)) throw new Error('Triple object is not an RDFNode');
	if(o.termType!=='NamedNode' && o.termType!=='BlankNode' && o.termType!=='Literal') throw new Error('object must be a NamedNode/BlankNode/Literal');

	this.subject = s;
	this.predicate = p;
	this.object = o;
};
api.Triple.prototype.size = 3;
api.Triple.prototype.length = 3;
api.Triple.prototype.toString = function() {
	return this.subject.toNT() + " " + this.predicate.toNT() + " " + this.object.toNT() + " .";
};
api.Triple.prototype.toNT = function toNT() {
	return this.subject.toNT() + " " + this.predicate.toNT() + " " + this.object.toNT() + " .";
};
api.Triple.prototype.toTurtle = function toTurtle(profile) {
	return this.subject.toTurtle(profile) + " " + this.predicate.toTurtle(profile) + " " + this.object.toTurtle(profile) + " .";
};
api.Triple.prototype.equals = function(t) {
	return RDFNodeEquals.call(this.subject,t.subject) && RDFNodeEquals.call(this.predicate,t.predicate) && RDFNodeEquals.call(this.object,t.object);
};
api.Triple.prototype.compare = function(other) {
	var r = 0;
	// test the return value, also assign to `r`
	if(r = this.subject.compare(other.subject)) return r;
	if(r = this.predicate.compare(other.predicate)) return r;
	if(r = this.object.compare(other.object)) return r;
};

/**
*/
api.Quad = function Quad(s, p, o, g) {
	if(typeof s=='string') s = new NamedNode(s);
	if(!api.RDFNode.is(s)) throw new Error('Quad subject is not an RDFNode');
	if(s.termType!=='NamedNode' && s.termType!=='BlankNode') throw new Error('`subject` must be a NamedNode/BlankNode');

	if(typeof p=='string') p = new NamedNode(p);
	if(!api.RDFNode.is(p)) throw new Error('Quad predicate is not an RDFNode');
	if(p.termType!=='NamedNode') throw new Error('`predicate` must be a NamedNode');

	if(typeof o=='string') o = new NamedNode(o);
	if(!api.RDFNode.is(o)) throw new Error('Quad object is not an RDFNode');
	if(o.termType!=='NamedNode' && o.termType!=='BlankNode' && o.termType!=='Literal') throw new Error('`object` must be a NamedNode/BlankNode/Literal');

	if(typeof g=='string') g = new NamedNode(g);
	if(!api.RDFNode.is(g)) throw new Error('Quad graph is not an RDFNode');
	if(g.termType!=='NamedNode' && g.termType!=='DefaultGraph') throw new Error('Quad `graph` must be a NamedNode/DefaultGraph');

	this.subject = s;
	this.predicate = p;
	this.object = o;
	this.graph = g;
};
api.Quad.prototype.size = 4;
api.Quad.prototype.length = 4;
api.Quad.prototype.toString = function() {
	return this.toNQ();
};
api.Quad.prototype.toNT = function toNT() {
	return this.subject.toNT() + " " + this.predicate.toNT() + " " + this.object.toNT() + " .";
};
api.Quad.prototype.toNQ = function toNQ() {
	if(this.graph){
		return this.subject.toNT() + " " + this.predicate.toNT() + " " + this.object.toNT() + " " + this.graph.toNT() + " .";
	}else{
		// the NT form is compatible with N-Quads
		return this.toNT();
	}
};
api.Quad.prototype.toTurtle = function toTurtle(profile) {
	return this.subject.toTurtle(profile) + " " + this.predicate.toTurtle(profile) + " " + this.object.toTurtle(profile) + " .";
};
api.Quad.prototype.equals = function(t) {
	return RDFNodeEquals.call(this.subject,t.subject) && RDFNodeEquals.call(this.predicate,t.predicate) && RDFNodeEquals.call(this.object,t.object) && RDFNodeEquals.call(this.graph,t.graph);
};
api.Quad.prototype.compare = function(other) {
	var r = 0;
	// test the return value, also assign to `r`
	if(r = this.subject.compare(other.subject)) return r;
	if(r = this.predicate.compare(other.predicate)) return r;
	if(r = this.object.compare(other.object)) return r;
	if(r = this.graph.compare(other.graph)) return r;
};

/**
 * Implements RDFNode http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-RDFNode
 */
api.RDFNode = function RDFNode() {};
api.RDFNode.is = function isRDFNode(n){
	if(!n) return false;
	if(n instanceof api.RDFNode) return true;
	if(typeof n.nodeType=='function') return true;
	return false;
};
api.RDFNode.prototype.equals = api.RDFNodeEquals = RDFNodeEquals;
api.RDFNode.prototype.compare = api.RDFNodeCompare = RDFNodeCompare;
api.RDFNode.prototype.nodeType = function() { return "RDFNode"; };
api.RDFNode.prototype.toNT = function() { return ""; };
api.RDFNode.prototype.toCanonical = function() { return this.toNT(); };
api.RDFNode.prototype.toString = function() { return this.nominalValue; };
api.RDFNode.prototype.valueOf = function() { return this.nominalValue; };
// Alignment to "Interface Specification: RDF Representation"
Object.defineProperty(api.RDFNode.prototype, 'value', { get: function(){
	return this.nominalValue;
} });

/**
 * BlankNode
 */
api.BlankNode = BlankNode;
inherits(api.BlankNode, api.RDFNode);
function BlankNode(id) {
	if(typeof id=='string' && id.substr(0,2)=='_:') this.nominalValue=id.substr(2);
	else if(id) this.nominalValue=id;
	else this.nominalValue = 'b'+(++api.BlankNode.NextId).toString();
}
api.BlankNode.NextId = 0;
api.BlankNode.prototype.nodeType = function() { return "BlankNode"; };
api.BlankNode.prototype.interfaceName = "BlankNode";
api.BlankNode.prototype.termType = "BlankNode";
api.BlankNode.prototype.toNT = function() {
	return "_:"+this.nominalValue;
};
api.BlankNode.prototype.toTurtle = function toTurtle() {
	return this.toNT();
};
api.BlankNode.prototype.n3 = function() {
	return this.toNT();
};
api.BlankNode.prototype.toString =  function() {
	return "_:"+this.nominalValue;
};

/**
 * Implements Literal http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Literal
 */
api.Literal = Literal;
inherits(api.Literal, api.RDFNode);
function Literal(value, type) {
	if(typeof value!='string') throw new TypeError('Expected argument[0] `value` to be a string');
	if(type!==null && type!==undefined && typeof type!='string' && !(type instanceof api.NamedNode)) throw new TypeError('Expected optional argument[1] `type` to be a string/RDFNode');
	this.nominalValue = value;
	if(type instanceof NamedNode){
		this.datatype = type;
		this.language = null;
	}else if(typeof type=='string'){
		if(type.match(/^[a-zA-Z]+(-[a-zA-Z0-9]+)*$/)){
			this.datatype = rdflangString;
			this.language = type;
		}else if(type.match(/^@[a-zA-Z]+(-[a-zA-Z0-9]+)*$/)){
			this.datatype = rdflangString;
			this.language = type.substring(1);
		}else if(type.match(/^[a-zA-Z][a-zA-Z0-9+.\-]*:/)){
			this.datatype = new NamedNode(type);
			this.language = null;
		}else{
			throw new Error('Expected argument[1] `type` to look like a LangTag or IRI');
		}
	}else{
		this.datatype = xsdstring;
		this.language = null;
	}
}
api.Literal.typed = function createTypedLiteral(value, datatype){
	if(typeof value!='string') throw new Error('Expected argument[0] `value` to be a string');
	if(typeof datatype!='string' && !(datatype instanceof api.NamedNode)) throw new Error('Expected argument[1] `datatype` to be a string');
	if(!datatype.toString().match(/^[a-zA-Z][a-zA-Z0-9+.\-]*:/)) throw new Error('Expected argument[1] `datatype` to be an IRI');
	var literal = new api.Literal(value);
	if(datatype.toString()!=='http://www.w3.org/2001/XMLSchema#string'){
		literal.datatype = datatype;
	}
	return literal;
};
api.Literal.language = function createLanguageLiteral(value, language){
	if(typeof value!='string') throw new Error('Expected argument[0] `value` to be a string');
	if(typeof language!='string') throw new Error('Expected argument[1] `language` to be a string');
	if(!language.match(/^[a-zA-Z]+(-[a-zA-Z0-9]+)*$/)) throw new Error('Expected argument[1] `language` to be a BCP47 language tag');
	var literal = new api.Literal(value);
	literal.language = language;
	return literal;
};
api.Literal.prototype.nodeType = function() {
	if(rdflangString.equals(this.datatype) && this.language) return 'PlainLiteral';
	if(xsdstring.equals(this.datatype)) return 'PlainLiteral';
	return 'TypedLiteral';
};
api.Literal.prototype.interfaceName = "Literal";
api.Literal.prototype.termType = "Literal";
api.Literal.prototype.toNT = function toNT() {
	var string = '"'+encodeString(this.nominalValue)+'"';
	if(this.language) return string+"@"+this.language;
	else if(xsdstring.equals(this.datatype)) return string;
	else if(this.datatype) return string+'^^<'+this.datatype+">";
	throw new Error('Unknown datatype');
};
api.Literal.prototype.toTurtle = function toTurtle(profile){
	if(xsdinteger.equals(this.datatype) && this.value.match(INTEGER)){
		return this.value;
	}
	if(xsddecimal.equals(this.datatype) && this.value.match(DECIMAL)){
		return this.value;
	}
	if(xsddouble.equals(this.datatype) && this.value.match(DOUBLE)){
		return this.value;
	}
	if(xsdboolean.equals(this.datatype) && this.value.match(BOOLEAN)){
		return this.value;
	}
	if(profile && this.type){
		var shrunk = profile.shrink(this.datatype.toString());
		if(shrunk!=this.datatype.toString()) return shrunk;
	}
	// TODO if it's xsd:integer/xsd:decimal/xsd:double/xsd:boolean, return simplified form
	return this.toNT();
};
api.Literal.prototype.n3 = function n3(profile){
	return this.toTurtle(profile);
};
// Literal#valueOf returns a language-native value - e.g. a number, boolean, or Date where possible
api.Literal.prototype.valueOf = function() {
	if(this.datatype && typeof api.Literal.typeValueOf[this.datatype]=="function"){
		return api.Literal.typeValueOf[this.datatype](this.nominalValue, this.datatype);
	}
	return this.nominalValue;
};
Object.defineProperty(api.Literal.prototype, 'type', { get: function(){
	if(rdflangString.equals(this.datatype)) return null;
	if(xsdstring.equals(this.datatype)) return null;
	return this.datatype.nominalValue;
} });


api.Literal.typeValueOf = {};
api.Literal.registerTypeConversion = function(datatype, f){
	api.Literal.typeValueOf[datatype] = f;
};
require('./space.js').loadDefaultTypeConverters(api.Literal);

/**
 * NamedNode
 */
api.NamedNode = NamedNode;
inherits(api.NamedNode, api.RDFNode);
function NamedNode(iri) {
	if(typeof iri!='string') throw new TypeError('argument iri not a string');
	if(iri[0]=='_' && iri[1]==':') throw new Error('unexpected BlankNode syntax');
	if(!iri.match(api.NamedNode.SCHEME_MATCH)) throw new Error('Expected arguments[0] `iri` to look like an IRI');
	if(iri.indexOf(' ') >= 0) throw new Error('Unexpected whitespace in arguments[0] `iri`');
	this.nominalValue = iri;
}
api.NamedNode.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");
api.NamedNode.prototype.nodeType = function nodeType() { return "IRI"; };
api.NamedNode.prototype.interfaceName = "NamedNode";
api.NamedNode.prototype.termType = "NamedNode";
api.NamedNode.prototype.toNT = function toNT() {
	return "<" + encodeString(this.nominalValue) + ">";
};
api.NamedNode.prototype.toTurtle = function toTurtle(profile) {
	if(profile){
		var shrunk = profile.shrink(this.nominalValue);
		if(shrunk!=this.nominalValue) return shrunk;
	}
	return this.toNT();
};
api.NamedNode.prototype.n3 = function n3(profile) {
	return this.toTurtle(profile);
};

/**
 * TriplePattern
 */
api.TriplePattern = function TriplePattern(s, p, o) {
	if(typeof s=='string') s = new NamedNode(s);
	if(!api.RDFNode.is(s)) throw new Error('TriplePattern subject is not an RDFNode');
	if(s.termType!=='NamedNode' && s.termType!=='BlankNode' && s.termType!=='Variable') throw new Error('subject must be a NamedNode/BlankNode/Variable');

	if(typeof p=='string') p = new NamedNode(p);
	if(!api.RDFNode.is(p)) throw new Error('TriplePattern predicate is not an RDFNode');
	if(p.termType!=='NamedNode' && p.termType!=='Variable') throw new Error('predicate must be a NamedNode/Variable');

	if(typeof o=='string') o = new NamedNode(o);
	if(!api.RDFNode.is(o)) throw new Error('TriplePattern object is not an RDFNode');
	if(o.termType!=='NamedNode' && o.termType!=='BlankNode' && o.termType!=='Literal' && o.termType!=='Variable') throw new Error('object must be a NamedNode/BlankNode/Literal/Variable');

	this.subject = s;
	this.predicate = p;
	this.object = o;
};
api.TriplePattern.prototype.size = 3;
api.TriplePattern.prototype.length = 3;
api.TriplePattern.prototype.toString = function() {
	return this.subject.n3() + " " + this.predicate.n3() + " " + this.object.n3() + " .";
};
api.TriplePattern.prototype.equals = function(t) {
	return RDFNodeEquals.call(this.subject,t.subject) && RDFNodeEquals.call(this.predicate,t.predicate) && RDFNodeEquals.call(this.object,t.object);
};

/**
 * Variable
 */
api.Variable = Variable;
inherits(api.Variable, api.RDFNode);
function Variable(name) {
	if(typeof name!='string') throw new Error('Expected arguments[0] `name` to be a string');
	if(name[0]=='?' || name[0]=='$') name = name.substring(1);
	this.nominalValue = name;
}
api.Variable.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");
api.Variable.prototype.nodeType = function nodeType() { return "Variable"; };
api.Variable.prototype.interfaceName = "Variable";
api.Variable.prototype.termType = "Variable";
api.Variable.prototype.toNT = function() {
	throw new Error('Cannot serialize variable to N-Triples');
};
api.Variable.prototype.toTurtle = function toTurtle() {
	throw new Error('Cannot serialize variable to Turtle');
};
api.Variable.prototype.n3 = function n3() {
	return '?'+this.nominalValue;
};

/*
interface DefaultGraph : Term {
	attribute string termType;
	attribute string value;
	boolean equals(Term other);
};
 */
api.DefaultGraph = DefaultGraph;
inherits(api.DefaultGraph, api.RDFNode);
function DefaultGraph() {
}
api.DefaultGraph.prototype.interfaceName = "DefaultGraph";
api.DefaultGraph.prototype.termType = "DefaultGraph";
api.DefaultGraph.prototype.nominalValue = "";
api.DefaultGraph.prototype.toNT = function() {
	throw new Error('Cannot serialize DefaultGraph to N-Triples');
};
api.DefaultGraph.prototype.toTurtle = function toTurtle() {
	throw new Error('Cannot serialize DefaultGraph to Turtle');
};
api.DefaultGraph.prototype.n3 = function n3() {
	throw new Error('Cannot serialize DefaultGraph to n3');
};

// Constants needed for processing Literals
var xsdstring = new NamedNode('http://www.w3.org/2001/XMLSchema#string');
var rdflangString = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');

// Shamelessly copied from Builtins.js, also found in TurtleParser.js
var xsdns = require('./ns.js').xsdns;
var INTEGER = new RegExp("^(-|\\+)?[0-9]+$", "");
var xsdinteger = new NamedNode(xsdns('integer'));
var DOUBLE = new RegExp("^(-|\\+)?(([0-9]+\\.[0-9]*[eE]{1}(-|\\+)?[0-9]+)|(\\.[0-9]+[eE]{1}(-|\\+)?[0-9]+)|([0-9]+[eE]{1}(-|\\+)?[0-9]+))$", "");
var xsddouble = new NamedNode(xsdns('double'));
var DECIMAL = new RegExp("^(-|\\+)?[0-9]*\\.[0-9]+?$", "");
var xsddecimal = new NamedNode(xsdns('decimal'));
var BOOLEAN = new RegExp("^(true|false)", "");
var xsdboolean = new NamedNode(xsdns('boolean'));
