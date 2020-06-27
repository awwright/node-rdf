"use strict";

var RDFNodeEquals = require('./RDFNode.js').RDFNodeEquals;
var RDFNode = require('./RDFNode.js').RDFNode;
var NamedNode = require('./RDFNode.js').NamedNode;
var BlankNode = require('./RDFNode.js').BlankNode;
var defaults = require('./prefixes.js');
var encodeString = require('./encodeString.js');
var env = require('./environment.js').environment;

var rdfnil = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil');
var rdffirst = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first');
var rdfrest = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest');
var rdftype = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
function xsdns(v){ return 'http://www.w3.org/2001/XMLSchema#'+v; }

function _(v) { return { writable:false, configurable:true, enumerable:false, value:v }; }
function _getter(v) { return { configurable:true, enumerable:false, get:v }; }
// Expands a Turtle/N3 keyword to an IRI
// p: property name
// profile: profile to use resolving prefixes
function expandprop(name, profile) {
	if(name instanceof RDFNode) return name;
	if(name == 'a') return rdftype;
	name = name.replace('$',':');
	var expanded = profile.resolve(name) || name;
	return new NamedNode(expanded);
}
function shrinkprop(ref, profile) {
	//if(rdftype.equals(ref)) return "a";
	return createNodeFrom(ref).toTurtle(profile);
}
function expandnode(p, profile) {
	if(p instanceof RDFNode){
		return p;
	}else if(p.substring(0,2)=='_:'){
		return new BlankNode(p);
	}else{
		return new NamedNode(profile.resolve(p) || p);
	}
}
function shrinknode(ref, profile) {
	return createNodeFrom(ref).toTurtle(profile);
}
function pad(v,l){
	return ('0000'+v).substr(-(l||2));
}
function n3(value, profile){
	if(typeof value.n3=='function') return value.n3(profile);
	if(typeof value=='string') return exports.String.n3.call(value, profile);
	if(typeof value=='number') return exports.Number.n3.call(value, profile);
	if(typeof value=='boolean') return exports.Boolean.n3.call(value, profile);
	if(value instanceof Date) return exports.Date.n3.call(value, profile);
	throw new TypeError('Cannot create n3 from '+Object.toString.call(value, profile));
}
function createNodeFrom(value){
	if(value instanceof BlankNode) return value;
	if(value instanceof NamedNode) return value;
	if(typeof value!='string') throw new TypeError('Expected string got '+JSON.stringify(value));
	if(value.substring(0,2)=='_:') return new BlankNode(value);
	else return new NamedNode(value);
}

// JS3/JSON-LD decoding
//function graphify(o, base, parentProfile){
//	if(!o.id) var o=o.ref();
//	return o.graphify(parentProfile);
//}

exports.StructuredGraph = {};
exports.StructuredGraph.graphify = function graphifyObject(aliasmap){
	var o = this;
	var graph = env.createGraph();
	var profile = this.getProfile(aliasmap);
	//var idNode = o.id;
	var idNode = this.isNamed ? this.id : (this['$id'] || this['@id'] || this.id);
	function graphify_property(s1,p1,o1) {
		if(typeof s1=='string') var s1n = createNodeFrom(s1);
		else if(s1 instanceof NamedNode) var s1n = s1;
		else if(s1 instanceof BlankNode) var s1n = s1;
		else throw new Error('Expected string/NamedNode/BlankNode subject');
		if(p1[0]=='@' || p1[0]=='$') return;
		if(typeof(o1)=='function' || typeof(o1)=='undefined') return;
		graphify_value(s1n, expandprop(p1,profile), o1);
	}
	function graphify_value(s1n,p1n,o1) {
		if(Array.isArray(o1) || o1['$list'] || o1['@list'] || o1['$set'] || o1['@set']) {
			if(o1['$list'] || o1['@list']){
				var arr = o1['$list'] || o1['@list'];
				var list = true;
			}else if(o1['$set'] || o1['@set']){
				var arr = o1['$set'] || o1['@set'];
				var list = false;
			}else{
				var arr = o1;
				var list = false;
			}
			// o1 is a Collection or a multi-valued property
			if(!list) {
				// o1 is a multi-valued property
				arr.forEach( function(item) { graphify_value(s1n, p1n, item); });
			} else {
				// o1 is an rdf:Collection
				if(o1.length == 0) {
					graph.add( env.createTriple(s1n, p1n, rdfnil ) );
				} else {
					var bnode = env.createBlankNode();
					graph.add( env.createTriple(s1n, p1n, bnode) );
					arr.forEach(function(item,x) {
						graphify_property(bnode, rdffirst, item);
						var n = env.createBlankNode();
						graph.add( env.createTriple(bnode, rdfrest, (x==arr.length-1) ? rdfnil : n ) );
						bnode = n;
					});
				}
			}
		}else  if(o1 instanceof RDFNode){
			graph.add( env.createTriple(s1n, p1n, o1 ) );
		}else if(o1 instanceof Date){
			var literal = exports.Date.toRDFNode.call(o1);
			graph.add( env.createTriple(s1n, p1n, literal ) );
		}else if(typeof o1=='object' && !o1.id) {
			var id = o1.id || o1['$id'] || o1['@id'];
			if(typeof o1=='object' && !o1.nodeType){
				// If the Object doesn't have a bnode, give it one
				o1 = ref.call(o1);
				id = id || o1.id;
			}
			// o1 is an Object, add triple and child triples
			graph.add( env.createTriple(s1n, p1n, createNodeFrom(id) ) );
			graph.addAll( o1.graphify(profile) );
		} else if(typeof o1=='string') {
			// o1 is a string (convert to NamedNode) or RDFNode (NamedNode, BlankNode, or Literal)
			graph.add( env.createTriple(s1n, p1n, expandnode(o1,profile) ) );
		} else if(typeof o1=='number') {
			graph.add( env.createTriple(s1n, p1n, exports.Number.toRDFNode.call(o1) ) );
		} else if(typeof o1=='boolean') {
			graph.add( env.createTriple(s1n, p1n, exports.Boolean.toRDFNode.call(o1) ) );
		} else {
			throw new Error('Unknown type '+(typeof o1));
		}
	}
	//if(typeof(id)=="object") throw new Error("Not an object: "+require('util').inspect(this));
	Object.keys(o).forEach(function(p) { graphify_property(idNode, p, o[p]); });
	return graph;
};

exports.StructuredGraph.n3 = function toN3(aliasmap, padding) {
	padding = padding||'\n\t';
	var outs = [];
	var o = this;
	// Determine the prefix/term profile this object is using
	var profile = exports.StructuredGraph.getProfile.call(o, aliasmap);
	var idNode = this.isNamed ? this.id : (this['$id'] || this['@id'] || this.id);
	// Go through each key and produce a predicate-object line
	Object.keys(this).forEach(toN3_property);
	function toN3_property(p) {
		// Ignore things beginning with @, they're keywords to be interperted
		if(p[0]=='$' || p[0]=='@' || (o.list&&p=='list')) return;
		var val = o[p];
		// val can be anything:
		// undefined, null, string, number, boolean, function, or object (Array, RDFNode, Date, or plain object)
		// Ignore functions, they're from the prototype probably
		if(typeof val == 'function') return;
		if(val === undefined) return;
		if(val === null) return;
		// Determine the name to output. Generate a PrefixedName if possible, otherwise output an IRIREF
		var predicateIRI = expandprop(p, profile);
		var predicateString = shrinkprop(predicateIRI, profile);
		outs.push( predicateString + ' ' + toN3_value(val) );
	}
	function toN3_value(val){
		if(typeof val=='string'){
			// If the value is an IRI, or an object without an IRI, recurse
			return shrinknode(expandnode(val, profile), profile);
		}else if(typeof val=='number' || typeof val=='boolean' || val instanceof Date){
			// If the value is an IRI, or an object without an IRI, recurse
			return n3(val, profile);
		}else if(val && typeof val.nodeType=='function' && val.nodeType() == 'IRI'){
			// If the value is a NamedNode instance, use that
			return shrinknode(val.toString(), profile);
		}else if(val && typeof val.id=='string'){
			// If the value is an object with an "id" property, use that as the object
			// Then don't forget to serialize the object out.
			var objectIRI = expandnode(val.id, profile);
			var objectName = shrinknode(objectIRI);
			return objectName;
		}
		if(val && val.nodeType && val.nodeType == 'IRI'){
			return val.n3(profile);
		}else if(Array.isArray(val)){
			return val.map(function(item){ return toN3_value(item, profile, padding+'\t'); }).join(', ');
		}else if(typeof val=='object' && val['@list'] && Array.isArray(val['@list'])){
			return '( ' + val['@list'].map(function(item){ return toN3_value(item, profile, padding+'\t'); }).join(' ') + ' )';
		}else if(typeof val=='object' && val['@set'] && Array.isArray(val['@set'])){
			return val['@set'].map(function(item){ return toN3_value(item, profile, padding+'\t'); }).join(', ');
		}else{
			// Encode a Literal, or recursively encode the object and the statements in it.
			var valref = (typeof val.n3=='function') ? val : ref.call(val) ;
			return valref.n3(profile, padding+'\t');
		}
	}
	if(this.isNamed){
		if(outs.length > 1) return shrinknode(idNode,profile) + padding + outs.join(";"+padding) + ' .';
		if(outs.length == 1) return shrinknode(idNode,profile) + ' ' + outs.join(";"+padding) + ' .';
		else return '';
	}else{
		return '[' + padding + outs.join(';'+padding+'') + padding + ']';
	}
};
exports.StructuredGraph.getProfile = function(aliasmap) {
	var o = this;
	// Determine the prefix/term profile this object is using
	var profile = env.createProfile();
	//profile.importProfile(env);
	defaults.loadRequiredPrefixMap(profile);
	if(o.aliasmap) profile.importProfile(o.aliasmap, true);
	if(aliasmap){
		profile.importProfile(aliasmap, true);
		if(aliasmap.terms.vocabulary) profile.setDefaultVocabulary(aliasmap.terms.vocabulary);
	}
	var context = o['$context']||o['@context'];
	if(context){
		for(var prefix in context){
			if(prefix[0]=='@' || prefix[0]=='$'){
				var keyword = prefix.substring(1);
				if(keyword=='vocab'){
					profile.setDefaultVocabulary(context[prefix]);
				}
			}else{
				profile.setPrefix(prefix, context[prefix]);
			}
		}
	}
	return profile;
};

exports.ref = ref;
function ref(id) {
	var copy = {};
	for(var n in this) copy[n] = this[n];
	//var copy = Object.create(this);
	Object.defineProperties(copy, {
		'id': _( id ? (env.resolve(id)||id) : env.createBlankNode().toString() ),
		'isNamed': _( !!id ),
		n3: _(exports.StructuredGraph.n3),
		toNT: _( function(a) {
			return this.graphify(a).toArray().join("\n");
		}),
		graphify: _(exports.StructuredGraph.graphify),
		using: _( function() {
			Object.defineProperty(this,'aliasmap',_(Array.prototype.slice.call(arguments)));
			return this;
		}),
		getProfile: _(exports.StructuredGraph.getProfile),
	});
	return copy;
}

// All
exports.Object = {
	equals: RDFNodeEquals,
	ref: ref,
};
exports.ObjectProperties = {
	equals: _(exports.Object.equals),
	ref: _(exports.Object.ref),
};
exports.setObjectProperties = function setObjectProperties(o){
	Object.defineProperties(o, exports.ObjectProperties);
};

// String
exports.String = {
	tl: function(t) {
		return env.createLiteral(this.toString(), null, t);
	},
	l: function(l) {
		return env.createLiteral(this.toString(), l, null);
	},
	resolve: function() {
		return env.resolve(this)||this.toString();
	},
	valueGetter: function(){
		return this.toString();
	},
	nodeType: function() {
		//if(this.type) return 'TypedLiteral';
		//if(this.language || this.indexOf(' ') >= 0 || this.indexOf(':') == -1 ) return 'PlainLiteral';
		if(this.substr(0,2) == '_:') return 'BlankNode';
		return 'IRI';
	},
	termTypeGetter: function() {
		if(this.substr(0,2) == '_:') return 'BlankNode';
		return 'NamedNode';
	},
	n3: function(profile) {
		// FIXME we don't actually use the 'PlainLiteral' or 'TypedLiteral' productions. Either remove them, or re-add detection of them to String#nodeType()
		switch(this.nodeType()) {
			case 'PlainLiteral': return ('"'+encodeString(this)+'"'+(this.language?'@'+this.language:'')).toString();
			case 'IRI':
				var resolved = this.resolve();
				return (resolved == this) ? "<"+encodeString(resolved)+">" : this.toString();
			case 'BlankNode': return this.toString();
			case 'TypedLiteral':
				if(this.type.resolve() == env.resolve("rdf:PlainLiteral")) return '"'+encodeString(this)+'"';
				return '"'+encodeString(this)+'"^^' + (new NamedNode(this.datatype)).n3(profile);
		}
	},
	toNT: function() {
		switch(this.nodeType()) {
			case 'PlainLiteral': return ('"' + encodeString(this) + '"' + ( this.language ? '@' + this.language : '')).toString();
			case 'IRI': return "<" + encodeString(this.resolve()) + ">";
			case 'BlankNode': return this.toString();
			case 'TypedLiteral':
				if(this.type.resolve() == env.resolve("rdf:PlainLiteral")) return '"' + encodeString(this) + '"';
				return '"' + encodeString(this) + '"^^<' + this.datatype + '>';
		}
	},
	toCanonical: function() {
		return this.n3();
	},
	profile: env,
};
exports.StringProperties = {
	tl: _(exports.String.tl),
	l: _(exports.String.l),
	resolve: _(exports.String.resolve),
	value: _getter(exports.String.valueGetter),
	nodeType: _(exports.String.nodeType),
	termType: _getter(exports.String.termTypeGetter),
	n3: _(exports.String.n3),
	toNT: _(exports.String.toNT),
	toCanonical: _(exports.String.toCanonical),
	profile: _(exports.String.profile),
};
exports.setStringProperties = function setStringProperties(o){
	Object.defineProperties(o, exports.StringProperties);
};

// Array
exports.Array = {
	toList: function() {
		this.list = true;
		return this;
	},
	n3: function(a, padding) {
		padding = padding||'\n\t';
		var outs = [];
		this.forEach( function(i) {
			if(typeof i == 'function') return;
			if(i.id && i.id.nodeType() == 'IRI') return outs.push( i.id.n3() );
			if(!i.nodeType) ref.call(i);
			outs.push(i.n3(a, padding+'\t'));
		});
		return this.list ? "("+padding+outs.join(padding)+" )" : outs.join(", ");
	},
};
exports.ArrayProperties = {
	toList: _(exports.Array.toList),
	n3: _(exports.Array.n3),
};

exports.setArrayProperties = function setArrayProperties(o){
	Object.defineProperties(o, exports.ArrayProperties);
};

// Boolean
exports.Boolean = {
	datatype: xsdns("boolean"),
	valueGetter: function(){ return this; },
	nodeType: function() { return "TypedLiteral"; },
	termType: "Literal",
	termTypeGetter: function() { return "Literal"; },
	n3: function() { return this.valueOf(); },
	toNT: function() { return '"' + this.valueOf() + '"' + "^^<" + this.datatype + '>'; },
	toRDFNode: function() { return env.createTypedLiteral(this.valueOf().toString(), xsdns("boolean")); },
	toCanonical: function() { return this.toNT(); },
};
exports.BooleanProperties = {
	datatype: _(exports.Boolean.datatype),
	value: _getter(exports.Boolean.valueGetter),
	nodeType: _(exports.Boolean.nodeType),
	termType: _getter( function() { return "Literal"; } ),
	n3: _(exports.Boolean.n3),
	toNT: _(exports.Boolean.toNT),
	toRDFNode: _(exports.Boolean.toRDFNode),
	toCanonical: _(exports.Boolean.toCanonical),
};
exports.setBooleanProperties = function setBooleanProperties(o){
	Object.defineProperties(o, exports.BooleanProperties);
};

// Date
exports.Date = {
	datatype: xsdns("dateTime"),
	valueGetter: function(){return this; },
	nodeType: function() { return "TypedLiteral"; },
	termTypeGetter: function() { return "Literal"; },
	n3: function(profile) {
		if(!this.getTime()) return '"NaN"^^<' + (new NamedNode(xsdns('double'))).n3(profile) + '>';
		return '"' + this.getUTCFullYear()+'-' + pad(this.getUTCMonth()+1)+'-' + pad(this.getUTCDate())+'T'
		+ pad(this.getUTCHours())+':' + pad(this.getUTCMinutes())+':' + pad(this.getUTCSeconds())+'Z"^^' + (new NamedNode(xsdns('dateTime'))).n3(profile);
	},
	toNT: function() { return this.n3(); },
	toRDFNode: function() {
		return env.createTypedLiteral(
			this.getUTCFullYear()+'-' + pad(this.getUTCMonth()+1)+'-' + pad(this.getUTCDate())+'T'
			+ pad(this.getUTCHours())+':' + pad(this.getUTCMinutes())+':' + pad(this.getUTCSeconds())+'Z',
			xsdns("dateTime")
		);
	},
	toCanonical: function() { return this.n3(); },
};
exports.DateProperties = {
	datatype: _(exports.Date.datatype),
	value: _getter(exports.Date.valueGetter),
	nodeType: _(exports.Date.nodeType),
	termType: _getter(exports.Date.termTypeGetter),
	n3: _(exports.Date.n3),
	toNT: _(exports.Date.toNT),
	toRDFNode: _(exports.Date.toRDFNode),
	toCanonical: _(exports.Date.toCanonical),
};
exports.setDateProperties = function setDateProperties(o){
	Object.defineProperties(o, exports.DateProperties);
};

// Number
var INTEGER = new RegExp("^(-|\\+)?[0-9]+$", "");
var DOUBLE = new RegExp("^(-|\\+)?(([0-9]+\\.[0-9]*[eE]{1}(-|\\+)?[0-9]+)|(\\.[0-9]+[eE]{1}(-|\\+)?[0-9]+)|([0-9]+[eE]{1}(-|\\+)?[0-9]+))$", "");
var DECIMAL = new RegExp("^(-|\\+)?[0-9]*\\.[0-9]+?$", "");
exports.Number = {
	datatypeGetter: function() {
		if(this == Number.POSITIVE_INFINITY) return xsdns('double');
		if(this == Number.NEGATIVE_INFINITY) return xsdns('double');
		if(isNaN(this)) return xsdns('double');
		var n = this.toString();
		if(INTEGER.test(n)) return xsdns('integer');
		if(DECIMAL.test(n)) return xsdns('decimal');
		if(DOUBLE.test(n)) return xsdns('double');
	},
	valueGetter: function(){
		return this;
	},
	nodeType: function() {
		return "TypedLiteral";
	},
	termTypeGetter: function() {
		return "Literal";
	},
	n3: function() {
		if(this == Number.POSITIVE_INFINITY) return '"INF"^^<' + xsdns('double') + '>';
		if(this == Number.NEGATIVE_INFINITY) return '"-INF"^^<' + xsdns('double') + '>';
		if(isNaN(this)) return '"NaN"^^<' + xsdns('double') + '>';
		return this.toString();
	},
	toNT: function() {
		if(this == Number.POSITIVE_INFINITY) return '"INF"^^<' + xsdns('double') + '>';
		if(this == Number.NEGATIVE_INFINITY) return '"-INF"^^<' + xsdns('double') + '>';
		if(isNaN(this)) return '"NaN"^^<' + xsdns('double') + '>';
		return '"' + this.toString() + '"' + "^^<" + exports.Number.datatypeGetter.call(this) + '>';
	},
	toRDFNode: function() {
		if(this == Number.POSITIVE_INFINITY) return env.createTypedLiteral('INF', xsdns('double'));
		if(this == Number.NEGATIVE_INFINITY) return env.createTypedLiteral('-INF', xsdns('double'));
		if(isNaN(this)) return env.createTypedLiteral('NaN', xsdns('double'));
		return env.createTypedLiteral(this.toString(), exports.Number.datatypeGetter.call(this));
	},
	toCanonical: function() {
		return this.nt();
	},
	toTL: function() {
		return this.nt();
	},
};
exports.NumberProperties = {
	datatype: {
		configurable:true,
		enumerable:false,
		get: exports.Number.datatypeGetter,
	},
	value: 	 _getter(exports.Number.valueGetter),
	nodeType: _( function() { return "TypedLiteral"; } ),
	termType: _getter(exports.Number.termTypeGetter),
	n3: _(exports.Number.n3),
	toNT: _(exports.Number.toNT),
	toRDFNode: _(exports.Number.toRDFNode),
	toCanonical: _(exports.Number.toCanonical),
	toTL: _(exports.Number.toTL),
};
exports.setNumberProperties = function setNumberProperties(o){
	Object.defineProperties(o, exports.NumberProperties);
};

// Sometimes the standard API context isn't global, and an Object in one context isn't an Object in another.
// For these cases, you'll need to call these functions by hand.
exports.setBuiltins = function setBuiltins(){
	function setOn(map, target){
		for(var n in map) if(target[n]!==undefined) throw new Error('Builtin already set');
	}

	setOn(exports.ObjectProperties, Object.prototype);
	setOn(exports.StringProperties, String.prototype);
	setOn(exports.ArrayProperties, Array.prototype);
	setOn(exports.BooleanProperties, Boolean.prototype);
	setOn(exports.DateProperties, Date.prototype);
	setOn(exports.NumberProperties, Number.prototype);

	exports.setObjectProperties(Object.prototype);
	exports.setStringProperties(String.prototype);
	exports.setArrayProperties(Array.prototype);
	exports.setBooleanProperties(Boolean.prototype);
	exports.setDateProperties(Date.prototype);
	exports.setNumberProperties(Number.prototype);
};

exports.unsetBuiltins = function unsetBuiltins(){
	function unsetOn(map, target){
		for(var n in map) if(target[n]===undefined) throw new Error('Builtin '+JSON.stringify(n)+' not set');
		for(var n in map){
			Object.defineProperty(target, n, {configurable:true, value:null});
			delete target[n];
		}
	}
	unsetOn(exports.ObjectProperties, Object.prototype);
	unsetOn(exports.StringProperties, String.prototype);
	unsetOn(exports.ArrayProperties, Array.prototype);
	unsetOn(exports.BooleanProperties, Boolean.prototype);
	unsetOn(exports.DateProperties, Date.prototype);
	unsetOn(exports.NumberProperties, Number.prototype);
};
