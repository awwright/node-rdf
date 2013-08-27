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
			return this.language==other.language && this.value==other.value;
		case "TypedLiteral":
			return this.type==other.type && this.value==other.value;
	}
	return this.toNT() == other.toNT();
}
api.RDFNodeEquals = RDFNodeEquals;

/**
* Implements Triple http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Triple
*/
api.Triple = function Triple(s, p, o) { this.subject = s; this.predicate = p; this.object = o; };
api.Triple.prototype.size = 3;
api.Triple.prototype.length = 3;
api.Triple.prototype.toString = function() { return this.subject.toNT() + " " + this.predicate.toNT() + " " + this.object.toNT() + " ." }
api.Triple.prototype.equals = function(t) { return RDFNodeEquals.call(this.subject,t.subject) && RDFNodeEquals.call(this.predicate,t.predicate) && RDFNodeEquals.call(this.object,t.object) }

/**
 * Implements RDFNode http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-RDFNode
 */
api.RDFNode = function RDFNode() {};
api.RDFNode.prototype.equals = api.RDFNodeEquals = RDFNodeEquals;
api.RDFNode.prototype.nodeType = function() { return "RDFNode" }
api.RDFNode.prototype.toNT = function() { return "" }
api.RDFNode.prototype.toCanonical = function() { return this.toNT() }
api.RDFNode.prototype.toString = function() { return this.value }
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
	if(typeof id=='string' && id.substr(0,2)=='_:') this.value=id.substr(2);
	else if(id) this.value=id;
	else this.value = 'b'+(++api.BlankNode.NextId).toString();
}
api.BlankNode.NextId = 0;
api.BlankNode.prototype = new api.RDFNode;
api.BlankNode.prototype.nodeType = function() { return "BlankNode"; }
api.BlankNode.prototype.toNT = function() { return "_:"+this.value; }
api.BlankNode.prototype.n3 = function() { return this.toNT(); }
api.BlankNode.prototype.toString =  function() { return "_:"+this.value; }
api.BlankNode.prototype.valueOf =  function() { return this.value; }

/**
 * Implements Literal http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Literal
 */
api.Literal = function Literal(value, language) {
	this.value = value;
	if(typeof language=="string" && language[0]=="@") this.language = language.slice(1);
	else if(typeof language=="string") this.datatype = language;
};
api.Literal.prototype = new api.RDFNode;
api.Literal.prototype.nodeType = function() {
	if(this.datatype) return "TypedLiteral";
	return "PlainLiteral";
}
api.Literal.prototype.toNT = function() {
	var string = '"'+api.encodeString(this.value)+'"';
	if(this.datatype) return string+'^^<'+this.datatype+">";
	if(this.language) return string+"@"+this.language;
	return string;
}
api.Literal.prototype.n3 = function() {
	return this.toNT();
}
api.Literal.prototype.valueOf = function() {
	if(this.datatype && typeof api.Literal.typeValueOf[this.datatype]=="function"){
		return api.Literal.typeValueOf[this.datatype](this.value, this.datatype);
	}
	return this.value;
}
api.Literal.typeValueOf = {};
api.Literal.registerTypeConversion = function(datatype, f){
	api.Literal.typeValueOf[datatype] = f;
}
require('./Default.js').loadDefaultTypeConverters(api.Literal);

/**
 * IRI
 */
api.IRI = function IRI(iri) { this.value = iri };
api.IRI.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");
api.IRI.prototype = new api.RDFNode;
api.IRI.prototype.nodeType = function nodeType() { return "IRI" };
api.IRI.prototype.toNT = function toNT() { return "<" + api.encodeString(this.value) + ">"; };
api.IRI.prototype.n3 = function n3() { return this.toNT(); }
api.IRI.prototype.defrag = function defrag() {
	var i = this.value.indexOf("#");
	return (i < 0) ? this : new api.IRI(this.value.slice(0, i));
}
api.IRI.prototype.isAbsolute = function isAbsolute() {
	return this.scheme()!=null && this.heirpart()!=null && this.fragment()==null;
}
api.IRI.prototype.toAbsolute = function toAbsolute() {
	if(this.scheme() == null && this.heirpart() == null) { throw new Error("IRI must have a scheme and a heirpart!"); }
	return this.resolveReference(this.value).defrag();
}
api.IRI.prototype.authority = function authority() {
	var heirpart = this.heirpart();
	if(heirpart.substring(0, 2) != "//") return null;
	var authority = heirpart.slice(2);
	var q = authority.indexOf("/");
	return q>=0 ? authority.substring(0, q) : authority;
}
api.IRI.prototype.fragment = function fragment() {
	var i = this.value.indexOf("#");
	return (i<0) ? null : this.value.slice(i);
}
api.IRI.prototype.heirpart = function heirpart() {
	var heirpart = this.value;
	var q = heirpart.indexOf("?");
	if(q >= 0) {
		heirpart = heirpart.substring(0, q);
	} else {
		q = heirpart.indexOf("#");;
		if(q >= 0) heirpart = heirpart.substring(0, q);
	}
	var q2 = this.scheme();
	if(q2 != null) heirpart = heirpart.slice(1 + q2.length);
	return heirpart;
}
api.IRI.prototype.host = function host() {
	var host = this.authority();
	var q = host.indexOf("@");
	if(q >= 0) host = host.slice(++q);
	if(host.indexOf("[") == 0) {
		q = host.indexOf("]");
		if(q > 0) return host.substring(0, q);
	}
	q = host.lastIndexOf(":");
	return q >= 0 ? host.substring(0, q) : host;
}
api.IRI.prototype.path = function path() {
	var q = this.authority();
	if(q == null) return this.heirpart();
	return this.heirpart().slice(q.length + 2);
}
api.IRI.prototype.port = function port() {
	var host = this.authority();
	var q = host.indexOf("@");
	if(q >= 0) host = host.slice(++q);
	if(host.indexOf("[") == 0) {
		q = host.indexOf("]");
		if(q > 0) return host.substring(0, q);
	}
	q = host.lastIndexOf(":");
	if(q < 0) return null;
	host = host.slice(++q);
	return host.length == 0 ? null : host;
}
api.IRI.prototype.query = function query() {
	var q = this.value.indexOf("?");
	if(q < 0) return null;
	var f = this.value.indexOf("#");
	if(f < 0) return this.value.slice(q);
	return this.value.substring(q, f)
}
api.removeDotSegments = function removeDotSegments(input) {
	var output = "";
	var q = 0;
	while(input.length > 0) {
		if(input.substr(0, 3) == "../" || input.substr(0, 2) == "./") {
			input = input.slice(input.indexOf("/"));
		}else if(input == "/.") {
			input = "/";
		}else if(input.substr(0, 3) == "/./") {
			input = input.slice(2);
		}else if(input.substr(0, 4) == "/../" || input == "/..") {
			input = (input=="/..") ? "/" : input.slice(3);
			q = output.lastIndexOf("/");
			output = (q>=0) ? output.substring(0, q) : "";
		}else if(input.substr(0, 2) == ".." || input.substr(0, 1) == ".") {
			input = input.slice(input.indexOf("."));
			q = input.indexOf(".");
			if(q >= 0) input = input.slice(q);
		}else {
			if(input.substr(0, 1) == "/") {
				output += "/";
				input = input.slice(1);
			}
			q = input.indexOf("/");
			if(q < 0) {
				output += input;
				input = "";
			}else {
				output += input.substring(0, q);
				input = input.slice(q);
			}
		}
	}
	return output;
}
api.IRI.prototype.resolveReference = function resolveReference(ref) {
	var reference;
	if(typeof ref == "string") {
		reference = new api.IRI(ref);
	}else if(ref.nodeType && ref.nodeType() == "IRI") {
		reference = ref;
	}else {
		throw new Error("Expected IRI or String");
	}
	var T = {scheme:"", authority:"", path:"", query:"", fragment:""};
	var q = "";
	if(reference.scheme() != null) {
		T.scheme = reference.scheme();
		q = reference.authority();
		T.authority += q!=null ? "//"+q : "";
		T.path = api.removeDotSegments(reference.path());
		T.query += reference.query()||'';
	}else {
		q = reference.authority();
		if(q != null) {
			T.authority = q!=null ? "//"+q : "";
			T.path = api.removeDotSegments(reference.path());
			T.query += reference.query()||'';
		}else {
			q = reference.path();
			if(q == "" || q == null) {
				T.path = this.path();
				q = reference.query();
				if(q != null) {
					T.query += q;
				}else {
					q = this.query();
					T.query += q!=null ? q : "";
				}
			}else {
				if(q.substring(0, 1) == "/") {
					T.path = api.removeDotSegments(q);
				}else {
					if(this.path() != null) {
						var q2 = this.path().lastIndexOf("/");
						if(q2 >= 0) {
							T.path = this.path().substring(0, ++q2);
						}
						T.path += reference.path();
					}else {
						T.path = "/" + q
					}
					T.path = api.removeDotSegments(T.path);
				}
				T.query += reference.query()||'';
			}
			q = this.authority();
			T.authority = q!=null ? "//" + q : "";
		}
		T.scheme = this.scheme();
	}
	T.fragment = reference.fragment()||'';
	return new api.IRI(T.scheme + ":" + T.authority + T.path + T.query + T.fragment);
}
api.IRI.prototype.scheme = function scheme() {
	var scheme = this.value.match(api.IRI.SCHEME_MATCH);
	return (scheme == null) ? null : scheme.shift().slice(0, -1);
}
api.IRI.prototype.userinfo = function userinfo() {
	var authority = this.authority();
	var q = authority.indexOf("@");
	return (q < 0) ? null : authority.substring(0, q);
}
api.IRI.prototype.toURIString = function toURIString(){
	return this.value.replace(/[\uA0-\uD7FF\uE000-\uFDCF\uFDF0-\uFFEF]/g, function(a){return encodeURI(a);});
}
