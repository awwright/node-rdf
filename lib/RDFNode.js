
var encodeString = require('./encodeString.js');
var api = exports;

function nodeType(v){
	if(v.nodeType) return v.nodeType();
	if(typeof v=='string') return (v.substr(0,2)=='_:')?'BlankNode':'IRI';
	return 'TypedLiteral';
}
api.nodeType = nodeType;

function RDFNodeEquals(other) {
	if(api.RDFNode.is(other)){
		if(nodeType(this)!=nodeType(other)) return false;
		switch(nodeType(this)) {
			case "IRI":
			case "BlankNode":
				return this.toString()==other.toString();
			case "PlainLiteral":
				return this.language==other.language && this.nominalValue==other.nominalValue;
			case "TypedLiteral":
				return this.datatype==other.datatype && this.nominalValue==other.nominalValue;
		}
		if(typeof this.toNT=='function' && typeof other.toNT=='function'){
			return this.toNT() == other.toNT();
		}
	}
	if(typeof this.valueOf=='function'){
		return this.valueOf() == other;
	}
	//throw new Error('Cannot compare values');
	return false;
}
api.RDFNodeEquals = RDFNodeEquals;

/**
* Implements Triple http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Triple
*/
api.Triple = function Triple(s, p, o) {
	if(!api.RDFNode.is(s)) throw new Error('Triple subject is not an RDFNode');
	if(s.termType!=='NamedNode' && s.termType!=='BlankNode') throw new Error('subject must be a NamedNode/BlankNode');
	if(!api.RDFNode.is(p)) throw new Error('Triple predicate is not an RDFNode');
	if(p.termType!=='NamedNode') throw new Error('predicate must be a NamedNode');
	if(!api.RDFNode.is(o)) throw new Error('Triple object is not an RDFNode');
	if(o.termType!=='NamedNode' && o.termType!=='BlankNode' && o.termType!=='Literal') throw new Error('object must be a NamedNode/BlankNode/Literal');
	this.subject = s;
	this.predicate = p;
	this.object = o;
};
api.Triple.prototype.size = 3;
api.Triple.prototype.length = 3;
api.Triple.prototype.toString = function() { return this.subject.toNT() + " " + this.predicate.toNT() + " " + this.object.toNT() + " ." }
api.Triple.prototype.equals = function(t) { return RDFNodeEquals.call(this.subject,t.subject) && RDFNodeEquals.call(this.predicate,t.predicate) && RDFNodeEquals.call(this.object,t.object) }

/**
 * Implements RDFNode http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-RDFNode
 */
api.RDFNode = function RDFNode() {};
api.RDFNode.is = function isRDFNode(n){
	if(n instanceof api.RDFNode) return true;
	if(typeof n.nodeType=='function') return true;
	return false;
}
api.RDFNode.prototype.equals = api.RDFNodeEquals = RDFNodeEquals;
api.RDFNode.prototype.nodeType = function() { return "RDFNode"; }
api.RDFNode.prototype.toNT = function() { return ""; }
api.RDFNode.prototype.toCanonical = function() { return this.toNT(); }
api.RDFNode.prototype.toString = function() { return this.nominalValue; }
api.RDFNode.prototype.valueOf = function() { return this.nominalValue; }

/**
 * BlankNode
 */
api.BlankNode = function BlankNode(id) {
	if(typeof id=='string' && id.substr(0,2)=='_:') this.nominalValue=id.substr(2);
	else if(id) this.nominalValue=id;
	else this.nominalValue = 'b'+(++api.BlankNode.NextId).toString();
}
api.BlankNode.NextId = 0;
// Or maybe: Object.create(api.RDFNode.prototype, {constructor: {value: api.NamedNode, enumerable:false}});
api.BlankNode.prototype = new api.RDFNode;
api.BlankNode.prototype.nodeType = function() { return "BlankNode"; }
api.BlankNode.prototype.interfaceName = "BlankNode";
api.BlankNode.prototype.termType = "BlankNode";
api.BlankNode.prototype.toNT = function() { return "_:"+this.nominalValue; }
api.BlankNode.prototype.n3 = function() { return this.toNT(); }
api.BlankNode.prototype.toString =  function() { return "_:"+this.nominalValue; }

/**
 * Implements Literal http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Literal
 */
api.Literal = function Literal(value, language) {
	if(typeof value!='string') throw new Error('Literal value not a string');
	this.nominalValue = value;
	if(typeof language=="string" && language[0]=="@") this.language = language.slice(1);
	else if(typeof language=="string") this.datatype = language;
};
api.Literal.prototype = new api.RDFNode;
api.Literal.prototype.nodeType = function() {
	if(this.datatype) return "TypedLiteral";
	return "PlainLiteral";
}
api.Literal.prototype.interfaceName = "Literal";
api.Literal.prototype.termType = "Literal";
api.Literal.prototype.toNT = function() {
	var string = '"'+encodeString(this.nominalValue)+'"';
	if(this.datatype) return string+'^^<'+this.datatype+">";
	if(this.language) return string+"@"+this.language;
	return string;
}
api.Literal.prototype.n3 = function() {
	return this.toNT();
}
/**
 * Literal#valueOf returns a language-native value - e.g. a number, boolean, or Date where possible
 */
api.Literal.prototype.valueOf = function() {
	if(this.datatype && typeof api.Literal.typeValueOf[this.datatype]=="function"){
		return api.Literal.typeValueOf[this.datatype](this.nominalValue, this.datatype);
	}
	return this.nominalValue;
}
api.Literal.typeValueOf = {};
api.Literal.registerTypeConversion = function(datatype, f){
	api.Literal.typeValueOf[datatype] = f;
}
require('./Default.js').loadDefaultTypeConverters(api.Literal);

/**
 * NamedNode
 */
api.NamedNode = function NamedNode(iri) {
	if(typeof iri!='string') throw new Error('argument iri not a string');
	if(iri[0]=='_' && iri[1]==':') throw new Error('unexpected BlankNode syntax');
	this.nominalValue = iri;
};
api.NamedNode.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");
api.NamedNode.prototype = new api.RDFNode;
api.NamedNode.prototype.nodeType = function nodeType() { return "IRI" };
api.NamedNode.prototype.interfaceName = "NamedNode";
api.NamedNode.prototype.termType = "NamedNode";
api.NamedNode.prototype.toNT = function toNT() { return "<" + encodeString(this.nominalValue) + ">"; };
api.NamedNode.prototype.n3 = function n3() { return this.toNT(); }
