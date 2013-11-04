var Triple = require("./RDFNode.js").Triple;
var IndexedGraph = require("./IndexedGraph.js").IndexedGraph;
var RDFEnvironment = require("./RDFEnvironment.js").RDFEnvironment;
var Profile = require("./Profile.js").Profile;
var RDFNodeEquals = require('./RDFNode.js').RDFNodeEquals;
var BlankNode = require("./RDFNode.js").BlankNode;
var defaults = require('./Default.js');

var rdfnil = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';
var rdffirst = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
var rdfrest = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';
function xsdns(v){ return 'http://www.w3.org/2001/XMLSchema#'+v; }

function _(v) { return { writable:false, configurable:false, enumerable:false, value:v } }
function _getter(v) { return { configurable:false, enumerable:false, get:v } }
function prop(p,l) {
	if(p == 'a') return 'rdf:type';
	p = p.replace('$',':');
	if(p.indexOf(':') == -1) p = env.resolve(p,l)||p;
	return p;
};
function pad(v,l){
	return ('0000'+v).substr(-(l||2));
}

var env = exports.environment = new RDFEnvironment;
Object.defineProperty(String.prototype, 'profile', _(env));
require('./Default.js').loadDefaultPrefixMap(env);

// N-Triples encoder
function encodeString(s) {
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
				skip = true
			}
			if(code > 1114111) { throw new Error("Char out of range"); }
			var hex = "00000000".concat((new Number(code)).toString(16).toUpperCase());
			if(code >= 65536) {
				out += "\\U" + hex.slice(-8)
			} else {
				if(code >= 127 || code <= 31) {
					switch(code) {
						case 9:	out += "\\t"; break;
						case 10: out += "\\n"; break;
						case 13: out += "\\r"; break;
						default: out += "\\u" + hex.slice(-4); break
					}
				} else {
					switch(code) {
						case 34: out += '\\"'; break;
						case 92: out += "\\\\"; break;
						default: out += s.charAt(i); break
					}
				}
			}
		} else {
			skip = !skip
		}
	}
	return out
};

// JS3/JSON-LD decoding
function graphify(o, base, parentProfile){
	if(!o.id) var o=o.ref();
	return o.graphify(parentProfile);
}
exports.graphify = graphify;

function graphifyObject(aliasmap){
	var o = this;
	var graph = new IndexedGraph;
	var profile = new Profile;
	//profile.importProfile(env);
	defaults.loadRequiredPrefixMap(profile);
	if(o.aliasmap) profile.importProfile(o.aliasmap, true);
	if(aliasmap) profile.importProfile(aliasmap, true);
	function res(term){
		// Terms with a hierarchical component are URIs
		var v;
		if((v=term.indexOf(':'))!==-1 && term[v+1]==='/') return term;
		// If no hierarchial component, try to resolve a CURIE
		return profile.resolve(term)||term;
	}
	var context = o['$context']||o['@context'];
	if(context){
		for(var prefix in context) profile.setPrefix(prefix, context[prefix]);
	}
	function graphify(s1,p1,o1) {
		if(p1[0]=='@' || p1[0]=='$') return;
		if(typeof(o1)=='function' || typeof(o1)=='undefined') return;
		var id = o1.id || o1['$id'] || o1['@id'];
		if(!o1.nodeType && !id && typeof(o1)!="string") ref.call(o1); // If the Object doesn't have a bnode, give it one
		id = id || o1.id;
		if(Array.isArray(o1) || o1['$list'] || o1['@list']) {
			var v = o1['$list'] || o1['@list'];
			if(v) (o1=v).list = true;
			// o1 is a Collection or a multi-valued property
			if(!o1.list) {
				// o1 is a multi-valued property
				o1.forEach( function(i) { graphify(res(s1), res(p1), i) });
			} else {
				// o1 is an rdf:Collection
				if(o1.length == 0) {
					graph.add( new Triple(res(s1), res(prop(p1,profile)), rdfnil ) );
				} else {
					var b = ref.call({}); // Generate bnode
					graph.add( new Triple(res(s1), res(prop(p1,profile)), res(b.id) ) );
					o1.forEach( function(i,x) {
						graphify(b.id, rdffirst, i );
						var n = ref.call({});
						graph.add( new Triple(res(b.id), rdfrest, (x == o1.length-1) ? rdfnil : res(n.id) ) );
						b = n;
					});
				}
			}
		} else if(id) {
			// o1 is an Object, add triple and child triples
			graph.add( new Triple(res(s1), res(prop(p1,profile)), res(id) ) );
			graph.merge( graphifyObject.call(o1, profile) );
		} else if(typeof(o1)=="string") {
			// o1 is a URI
			graph.add( new Triple(res(s1), res(prop(p1,profile)), res(o1) ) );
		} else {
			// o1 is a literal
			graph.add( new Triple(res(s1), res(prop(p1,profile)), o1 ) );
		}
	}
	if(typeof(id)=="object") throw new Error("Not an object: "+require('util').inspect(this));
	Object.keys(o).forEach(function(p) { graphify(o.id, p, o[p]) });
	return graph;
}

var ref = exports.ref = function ref(id) {
	Object.defineProperties(this, {
		id: _( id ? (typeof id.resolve=='function'?id.resolve():id) : (new BlankNode).toString() ),
		n3: _( function(aliasmap, padding) {
			padding = padding||'\n\t';
			var outs = [];
			var o = this;
			var profile = new Profile;
			//profile.importProfile(env);
			defaults.loadRequiredPrefixMap(profile);
			if(o.aliasmap) profile.importProfile(o.aliasmap, true);
			if(aliasmap) profile.importProfile(aliasmap, true);
			Object.keys(this).forEach(function(p) {
				if(typeof o[p] == 'function') return;
				if(p[0]=='$' || p[0]=='@' || o.list&&p=='list') return;
				if(o[p].id && o[p].id.nodeType() == 'IRI') return outs.push( prop(p,profile) + ' ' + o[p].id.n3() );
				if(!o[p].nodeType && !o[p].id) ref.call(o[p]);
				outs.push( padding + (o.list?'':prop(p, profile)+' ') + o[p].n3(profile, padding+'\t') );
			});
			if(id) return this.id.n3(undefined)+outs.join(";")+' .';
			if(this.list) return '( '+outs.join(' ')+' )';
			return '['+outs+' ]';
		}),
		toNT: _( function(a) {
			return this.graphify(a).toArray().join("\n");
		}),
		graphify: _(graphifyObject),
		using: _( function() {
			Object.defineProperty(this,'aliasmap',_(Array.prototype.slice.call(arguments)));
			return this;
		})
	});
	return this;
}

// All
var ObjectProperties = {
	equals: _(RDFNodeEquals),
	ref: _(ref),
};
exports.setObjectProperties = function setObjectProperties(o){
	Object.defineProperties(o, ObjectProperties);
}

// String
var StringProperties = {
	tl: _( function(t) {
		return env.createLiteral(this.toString(), null, t);
	}),
	l: _( function(l) {
		return env.createLiteral(this.toString(), l, null);
	}),
	resolve: _( function() {
		if(this.indexOf(':')<0 || this.indexOf("//")>=0 ) return this.toString();
		return env.resolve(this)||this.toString();
	}),
	value: _getter(function(){return this.toString();}),
	nodeType: _( function() {
		//if(this.type) return 'TypedLiteral';
		//if(this.language || this.indexOf(' ') >= 0 || this.indexOf(':') == -1 ) return 'PlainLiteral';
		if(this.substr(0,2) == '_:') return 'BlankNode';
		return 'IRI';
	}),
	n3: _( function() {
		// FIXME we don't actually use the 'PlainLiteral' or 'TypedLiteral' productions. Either remove them, or re-add detection of them to String#nodeType()
		switch(this.nodeType()) {
			case 'PlainLiteral': return ('"'+encodeString(this)+'"'+(this.language?'@'+this.language:'')).toString();
			case 'IRI':
				var resolved = this.resolve();
				return (resolved == this) ? "<"+encodeString(resolved)+">" : this.toString();
			case 'BlankNode': return this.toString();
			case 'TypedLiteral':
				if(this.type.resolve() == env.resolve("rdf:PlainLiteral")) return '"'+encodeString(this)+'"';
				return '"'+encodeString(this)+'"^^<'+this.datatype+'>';
		}
	}),
	toNT: _( function() {
		switch(this.nodeType()) {
			case 'PlainLiteral': return ('"' + encodeString(this) + '"' + ( this.language ? '@' + this.language : '')).toString();
			case 'IRI': return "<" + encodeString(this.resolve()) + ">";
			case 'BlankNode': return this.toString();
			case 'TypedLiteral':
				if(this.type.resolve() == env.resolve("rdf:PlainLiteral")) return '"' + encodeString(this) + '"';
				return '"' + encodeString(this) + '"^^<' + this.datatype + '>';
		}
	}),
	toCanonical: _( function() { return this.n3() } )
};
exports.setStringProperties = function setStringProperties(o){
	Object.defineProperties(o, StringProperties);
}

// Array
var ArrayProperties = {
	toList: _(function() {
		this.list = true;
		return this;
	}),
	n3: _( function(a, padding) {
		padding = padding||'\n\t';
		var outs = [];
		this.forEach( function(i) {
			if(typeof i == 'function') return;
			if(i.id && i.id.nodeType() == 'IRI') return outs.push( i.id.n3() );
			if(!i.nodeType) ref.call(i);
			outs.push(i.n3(a, padding+'\t'))
		});
		return this.list ? "("+padding+outs.join(padding)+" )" : outs.join(", ");
	})
};

exports.setArrayProperties = function setArrayProperties(o){
	Object.defineProperties(o, ArrayProperties);
}

// Boolean
var BooleanProperties = {
	datatype: _( xsdns("boolean") ),
	value: _getter(function(){return this;}),
	nodeType: _( function() { return "TypedLiteral"} ),
	n3: _( function() { return this.valueOf() } ),
	toNT: _( function() { return '"' + this.valueOf() + '"' + "^^<" + this.datatype + '>' } ),
	toCanonical: _( function() { return this.toNT() } )
};
exports.setBooleanProperties = function setBooleanProperties(o){
	Object.defineProperties(o, BooleanProperties);
}

// Date
var DateProperties = {
	datatype: _( xsdns("dateTime") ),
	value: _getter(function(){return this;}),
	nodeType: _( function() { return "TypedLiteral"} ),
	n3: _( function() {
		if(!this.getTime()) return '"NaN"^^<' + xsdns('double') + '>';
		return '"' + this.getUTCFullYear()+'-' + pad(this.getUTCMonth()+1)+'-' + pad(this.getUTCDate())+'T'
		+ pad(this.getUTCHours())+':' + pad(this.getUTCMinutes())+':' + pad(this.getUTCSeconds())+'Z"^^<' + this.datatype + '>';
	}),
	toNT: _( function() { return this.n3() } ),
	toCanonical: _( function() { return this.n3() } )
}
exports.setDateProperties = function setDateProperties(o){
	Object.defineProperties(o, DateProperties);
}

// Number
var INTEGER = new RegExp("^(-|\\+)?[0-9]+$", "");
var DOUBLE = new RegExp("^(-|\\+)?(([0-9]+\\.[0-9]*[eE]{1}(-|\\+)?[0-9]+)|(\\.[0-9]+[eE]{1}(-|\\+)?[0-9]+)|([0-9]+[eE]{1}(-|\\+)?[0-9]+))$", "");
var DECIMAL = new RegExp("^(-|\\+)?[0-9]*\\.[0-9]+?$", "");
var NumberProperties = {
	datatype: {
		configurable : false, enumerable: false,
		get: function() {
			if(this == Number.POSITIVE_INFINITY) return xsdns('double');
			if(this == Number.NEGATIVE_INFINITY) return xsdns('double');
			if(isNaN(this)) return xsdns('double');
			var n = this.toString();
			if(INTEGER.test(n)) return xsdns('integer');
			if(DECIMAL.test(n)) return xsdns('decimal');
			if(DOUBLE.test(n)) return xsdns('double');
		}
	},
	value: 	 _getter(function(){return this;}),
	nodeType: _( function() { return "TypedLiteral" } ),
	n3: _( function() {
		if(this == Number.POSITIVE_INFINITY) return '"INF"^^<' + xsdns('double') + '>';
		if(this == Number.NEGATIVE_INFINITY) return '"-INF"^^<' + xsdns('double') + '>';
		if(isNaN(this)) return '"NaN"^^<' + 'xsd:double'.resolve() + '>';
		return this.toString();
	}),
	toNT: _( function() {
		if(this == Number.POSITIVE_INFINITY) return '"INF"^^<' + xsdns('double') + '>';
		if(this == Number.NEGATIVE_INFINITY) return '"-INF"^^<' + xsdns('double') + '>';
		if(isNaN(this)) return '"NaN"^^<' + xsdns('double') + '>';
		return '"' + this.toString() + '"' + "^^<" + this.datatype + '>';
	}),
	toCanonical: _( function() { return this.nt() } ),
	toTL: _( function() { return this.nt() } )
}
exports.setNumberProperties = function setNumberProperties(o){
	Object.defineProperties(o, NumberProperties);
}

exports.toStruct = function toStruct(o){
	var r;
	if(typeof o=='string'||o instanceof String){
		r = new String(o);
		api.setStringProperties(r);
	}else if(o instanceof Array){
		r = new Array(o);
		api.setArrayProperties(r);
	}else if(typeof o=='boolean'||o instanceof Boolean){
		r = new Boolean(o);
		api.setBooleanProperties(r);
	}else if(o instanceof Date){
		r = new Date(o);
		api.setNumberProperties(r);
	}else if(typeof o=='number'||o instanceof Number){
		r = new Number(o);
		api.setNumberProperties(r);
	}else{
		r = new Object(o);
	}
	api.setObjectProperties(r);
	return r;
}

// Sometimes the standard API context isn't global, and an Object in one context isn't an Object in another.
// For these cases, you'll need to call these functions by hand.
exports.setBuiltins = function setBuiltins(){
	exports.setObjectProperties(Object.prototype);
	exports.setStringProperties(String.prototype);
	exports.setArrayProperties(Array.prototype);
	exports.setBooleanProperties(Boolean.prototype);
	exports.setDateProperties(Date.prototype);
	exports.setNumberProperties(Number.prototype);
}
