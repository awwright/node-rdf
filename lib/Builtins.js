var bn = Date.now(); // This doesn't need to be unique at all! Who cares about uniqueness!
function _(v) { return { writable:false, configurable:false, enumerable:false, value:v } }
function _getter(v) { return { configurable:false, enumerable:false, get:v } }
function prop(p,l) {
	if(p == 'a') return 'rdf:type';
	p = p.replace('$',':');
	if(p.indexOf(':') == -1) p = env.resolve(p,l)||p;
	return p;
};

var Triple = require("./RDFNode.js").Triple;
var IndexedGraph = require("./IndexedGraph.js").IndexedGraph;
var RDFEnvironment = require("./RDFEnvironment.js").RDFEnvironment;
var RDFNodeEquals = require('./RDFNode.js').RDFNodeEquals;

var env = exports.environment = String.prototype.profile = new RDFEnvironment;
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

// All
var ObjectProperties = {
	equals: _(RDFNodeEquals),
	ref: _( function(id) {
		var ref = arguments.callee;
		Object.defineProperties(this, {
			id: _( id ? id.resolve() : '_:b' +(++bn) ),
			n3: _( function(a) {
				var outs = [], o = this, map = o.aliasmap || a;
				Object.keys(this).forEach(function(p) {
					if(typeof o[p] == 'function') return;
					if(o[p].id && o[p].id.nodeType() == 'IRI') return outs.push( prop(p,map) + ' ' + o[p].id.n3() );
					if(!o[p].nodeType && !o[p].id) ref.call(o[p]);
					outs.push( prop(p, map) + ' ' + o[p].n3(map) );
				});
				outs = outs.join(";\n	");
				return id ? this.id.n3() + ' ' + outs + ' .' : '[ ' + outs + ' ]';
			}),
			toNT: _( function(a) {
				return this.graphify(a).toArray().join("\n");
			}),
			graphify: _( function(a) {
				var graph = new IndexedGraph;
				var o = this
				var map = o.aliasmap || a;
				function graphify(s1,p1,o1) {
					if(typeof(o1)=='function' || typeof(o1)=='undefined') return;
					if(!o1.nodeType && !o1.id && typeof(o1)!="string") ref.call(o1); // If the Object doesn't have a bnode, give it one
					if(o1.id) {
						// o1 is an Object, add triple and child triples
						graph.add( new Triple(s1.resolve(), prop(p1,map).resolve(), o1.id.resolve() ) );
						graph.merge( o1.graphify() );
					} else if(typeof(o1)=="string") {
						// o1 is a URI
						graph.add( new Triple(s1.resolve(), prop(p1,map).resolve(), o1.resolve() ) );
					} else if(!Array.isArray(o1)) {
						// o1 is a literal
						graph.add( new Triple(s1.resolve(), prop(p1,map).resolve(), o1 ) );
					} else if(Array.isArray(o1)) {
						// o1 is a Collection or a multi-valued property
						if(!o1.list) {
							// o1 is a multi-valued property
							o1.forEach( function(i) { graphify(s1.resolve(), p1.resolve(), i) });
						} else {
							// o1 is an rdf:Collection
							if(o1.length == 0) {
								graph.add( new Triple(s1.resolve(), prop(p1,map).resolve(), env.resolve("rdf:nil") ) );
							} else {
								var b = ref.call({}); // Generate bnode
								graph.add( new Triple(s1.resolve(), prop(p1,map).resolve(), b.id.resolve() ) );
								o1.forEach( function(i,x) {
									graphify(b.id, env.resolve('rdf:first'), i );
									var n = ref.call({});
									graph.add( new Triple(b.id.resolve(), 'rdf:rest'.resolve(), (x == o1.length-1) ? env.resolve('rdf:nil') : n.id.resolve() ) );
									b = n;
								});
							}
						}
					}
				}
				if(typeof(id)=="object") throw new Error("Not an object: "+require('util').inspect(this));
				Object.keys(this).forEach(function(p) { graphify(o.id, p, o[p]) });
				return graph;
			}),
			using: _( function() {
				Object.defineProperty(this,'aliasmap',_(Array.prototype.slice.call(arguments)));
				return this;
			})
		});
		return this;
	}),
};
exports.setObjectProperties = function(o){
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
		switch(this.nodeType()) {
			case 'PlainLiteral': return ('"' + encodeString(this) + '"' + ( this.language ? '@' + this.language : '')).toString(); 
			case 'IRI':
				var resolved = this.resolve();
				return (resolved == this) ? "<" + encodeString(resolved) + ">" : this.toString();
			case 'BlankNode': return this.toString();
			case 'TypedLiteral':
				if(this.type.resolve() == env.resolve("rdf:PlainLiteral")) return '"' + encodeString(this) + '"'; 
				return '"' + encodeString(this) + '"^^' + this.type.n3();
		}
	}),
	toNT: _( function() {
		switch(this.nodeType()) {
			case 'PlainLiteral': return ('"' + encodeString(this) + '"' + ( this.language ? '@' + this.language : '')).toString(); 
			case 'IRI': return "<" + encodeString(this.resolve()) + ">";
			case 'BlankNode': return this.toString();
			case 'TypedLiteral':
				if(this.type.resolve() == env.resolve("rdf:PlainLiteral")) return '"' + encodeString(this) + '"'; 
				return '"' + encodeString(this) + '"^^' + this.type.n3();
		}
	}),
	toCanonical: _( function() { return this.n3() } )
};
exports.setStringProperties = function(o){
	Object.defineProperties(o, StringProperties);
}
exports.setStringProperties(String.prototype);

// Array
var ArrayProperties = {
	list: _(false),
	toList: _(function() {
		this.list = true;
		return this;
	}),
	nodeType: _("Collection"),
	n3: _( function(a) {
		var outs = [];
		this.forEach( function(i) {
			if(typeof i == 'function') return;
			if(i.id && i.id.nodeType() == 'IRI') return outs.push( i.id.n3() );
			if(!i.nodeType) exports.setObjectProperties(i);
			outs.push(i.n3(a))
		});
		return this.list ? "( " + outs.join(" ") + " )" : outs.join(", ");
	})
};

exports.setArrayProperties = function(o){
	Object.defineProperties(o, ArrayProperties);
}

// Boolean
var BooleanProperties = {
	datatype: _( env.resolve("xsd:boolean") ),
	value: _getter(function(){return this;}),
	nodeType: _( function() { return "TypedLiteral"} ),
	n3: _( function() { return this.valueOf() } ),
	toNT: _( function() { return '"' + this.valueOf() + '"' + "^^<" + this.type + '>' } ),
	toCanonical: _( function() { return this.toNT() } )
};
exports.setBooleanProperties = function(o){
	Object.defineProperties(o, BooleanProperties);
}

// Date
var DateProperties = {
	datatype: _( env.resolve("xsd:dateTime") ),
	value: _getter(function(){return this;}),
	nodeType: _( function() { return "TypedLiteral"} ),
	n3: _( function() {
		return '"' + this.getUTCFullYear()+'-' + pad(this.getUTCMonth()+1)+'-' + pad(this.getUTCDate())+'T'
		+ pad(this.getUTCHours())+':' + pad(this.getUTCMinutes())+':' + pad(this.getUTCSeconds())+'Z"^^<' + this.type + '>';
	}),
	toNT: _( function() { return this.n3() } ),
	toCanonical: _( function() { return this.n3() } )
}
exports.setDateProperties = function(o){
	Object.defineProperties(Date.prototype, o);
}

// Number
var INTEGER = new RegExp("^(-|\\+)?[0-9]+$", "");
var DOUBLE = new RegExp("^(-|\\+)?(([0-9]+\\.[0-9]*[eE]{1}(-|\\+)?[0-9]+)|(\\.[0-9]+[eE]{1}(-|\\+)?[0-9]+)|([0-9]+[eE]{1}(-|\\+)?[0-9]+))$", "");
var DECIMAL = new RegExp("^(-|\\+)?[0-9]*\\.[0-9]+?$", "");
var NumberProperties = {
	datatype: {
		configurable : false, enumerable: false,
		get: function() {
			if(this == Number.POSITIVE_INFINITY) return env.resolve('xsd:double');
			if(this == Number.NEGATIVE_INFINITY) return env.resolve('xsd:double');
			if(isNaN(this)) return env.resolve('xsd:double');
			var n = this.toString();
			if(INTEGER.test(n)) return env.resolve('xsd:integer');
			if(DECIMAL.test(n)) return env.resolve('xsd:decimal');
			if(DOUBLE.test(n)) return env.resolve('xsd:double');
		}
	},
	value: 	 _getter(function(){return this;}),
	nodeType: _( function() { return "TypedLiteral" } ),
	n3: _( function() {
		if(this == Number.POSITIVE_INFINITY) return '"INF"^^<' + env.resolve('xsd:double') + '>';
		if(this == Number.NEGATIVE_INFINITY) return '"-INF"^^<' + env.resolve('xsd:double') + '>';
		if(isNaN(this)) return '"NaN"^^<' + 'xsd:double'.resolve() + '>';
		return this.toString();
	}),
	toNT: _( function() {
		if(this == Number.POSITIVE_INFINITY) return '"INF"^^<' + env.resolve('xsd:double') + '>';
		if(this == Number.NEGATIVE_INFINITY) return '"-INF"^^<' + env.resolve('xsd:double') + '>';
		if(isNaN(this)) return '"NaN"^^<' + env.resolve('xsd:double') + '>';
		return '"' + this.toString() + '"' + "^^<" + this.type + '>';
	}),
	toCanonical: _( function() { return this.nt() } ),
	toTL: _( function() { return this.nt() } )
}
exports.setNumberProperties = function(o){
	Object.defineProperties(o, NumberProperties);
}

exports.toStruct = function(o){
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
