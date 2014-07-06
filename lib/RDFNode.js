var api = exports;

function nodeType(v){
	if(v.nodeType) return v.nodeType();
	if(typeof v=='string') return (v.substr(0,2)=='_:')?'BlankNode':'IRI';
	return 'TypedLiteral';
}
api.nodeType = nodeType;

function RDFNodeEquals(other) {
	if(nodeType(this)!=nodeType(other)) return false;
	switch(nodeType(this)) {
		case "IRI":
		case "BlankNode":
			return this.toString()==other.toString();
		case "PlainLiteral":
			return this.language==other.language && this.nominalValue==other.nominalValue;
		case "TypedLiteral":
			return this.type==other.type && this.nominalValue==other.nominalValue;
	}
	return this.toNT() == other.toNT();
}
api.RDFNodeEquals = RDFNodeEquals;

/**
* Implements Triple http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Triple
*/
api.Triple = function Triple(s, p, o) {
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
api.RDFNode.prototype.equals = api.RDFNodeEquals = RDFNodeEquals;
api.RDFNode.prototype.nodeType = function() { return "RDFNode"; }
api.RDFNode.prototype.toNT = function() { return ""; }
api.RDFNode.prototype.toCanonical = function() { return this.toNT(); }
api.RDFNode.prototype.toString = function() { return this.nominalValue; }
api.RDFNode.prototype.valueOf = function() { return this.nominalValue; }
api.encodeString = function(s) {
	var out = "";
	var skip = false;
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(!skip) {
			var code = s.charCodeAt(i);
			if(55296 <= code && code <= 56319) {
				var low = s.charCodeAt(i + 1);
				code = (code - 55296) * 1024 + (low - 56320) + 65536;
				skip = true;
			}
			if(code > 1114111) { throw new Error("Char out of range"); }
			var hex = "00000000".concat((new Number(code)).toString(16).toUpperCase());
			if(code >= 65536) {
				out += "\\U" + hex.slice(-8);
			} else {
				if(code >= 127 || code <= 31) {
					switch(code) {
						case 9:	out += "\\t"; break;
						case 10: out += "\\n"; break;
						case 13: out += "\\r"; break;
						default: out += "\\u" + hex.slice(-4); break;
					}
				} else {
					switch(code) {
						case 34: out += '\\"'; break;
						case 92: out += "\\\\"; break;
						default: out += s.charAt(i); break;
					}
				}
			}
		} else {
			skip = !skip;
		}
	}
	return out;
}

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
api.BlankNode.prototype.toNT = function() { return "_:"+this.nominalValue; }
api.BlankNode.prototype.n3 = function() { return this.toNT(); }
api.BlankNode.prototype.toString =  function() { return "_:"+this.nominalValue; }

/**
 * Implements Literal http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Literal
 */
api.Literal = function Literal(value, language) {
	this.nominalValue = value;
	if(typeof language=="string" && language[0]=="@") this.language = language.slice(1);
	else if(typeof language=="string") this.datatype = language;
};
api.Literal.prototype = new api.RDFNode;
api.Literal.prototype.nodeType = function() {
	if(this.datatype) return "TypedLiteral";
	return "PlainLiteral";
}
api.Literal.prototype.toNT = function() {
	var string = '"'+api.encodeString(this.nominalValue)+'"';
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
api.NamedNode = function NamedNode(iri) { this.nominalValue = iri };
api.NamedNode.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");
api.NamedNode.prototype = new api.RDFNode;
api.NamedNode.prototype.nodeType = function nodeType() { return "IRI" };
api.NamedNode.prototype.toNT = function toNT() { return "<" + api.encodeString(this.nominalValue) + ">"; };
api.NamedNode.prototype.n3 = function n3() { return this.toNT(); }
