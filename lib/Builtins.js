"use strict";

var RDFNodeEquals = require('./RDFNode.js').RDFNodeEquals;
var NamedNode = require('./RDFNode.js').NamedNode;
var BlankNode = require('./RDFNode.js').BlankNode;
var Literal = require('./RDFNode.js').Literal;
var defaults = require('./Default.js');
var encodeString = require('./encodeString.js');
var env = require('./environment.js').environment;

var rdfnil = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';
var rdffirst = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
var rdfrest = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';
function xsdns(v){ return 'http://www.w3.org/2001/XMLSchema#'+v; }

function _(v) { return { writable:false, configurable:true, enumerable:false, value:v } }
function _getter(v) { return { configurable:true, enumerable:false, get:v } }
// Expands a Turtle/N3 keyword to an IRI
// p: property name
// l: profile to use resolving prefixes
function prop(p,l) {
	if(p == 'a') return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
	if(p.indexOf('$') >= 0) p = p.replace('$',':');
	return env.resolve(p,l) || p;
};
function shrink(ref, profile) {
	var IRI = prop(ref, profile);
	var short = profile.shrink(IRI);
	return (short==IRI) ? env.createNamedNode(IRI).toNT() : short ;
};
function pad(v,l){
	return ('0000'+v).substr(-(l||2));
}
function createTypedLiteralFrom(value){
	if(typeof value=='string') return new Literal(value, 'http://www.w3.org/2001/XMLSchema#string');
	if(typeof value=='number') return new Literal(value.toString(), exports.NumberProperties.datatype.get.call(value));
	if(typeof value=='boolean') return new Literal(value.toString(), exports.BooleanProperties.datatype.get.call(value));
	if(Date.isDate(value)) return new Literal(value.toString(), exports.DateProperties.datatype.get.call(value));
	if(value && value.datatype instanceof NamedNode) return new Literal(value.toString(), value.datatype);
	throw new TypeError('Cannot create Literal from '+Object.toString.call(value));
}
function createNamedNodeFrom(value){
	if(typeof value!='string') throw new TypeError('Expected string');
	if(value.substring(0,2)=='_:') return new BlankNode(value);
	else return new NamedNode(value);
}

// JS3/JSON-LD decoding
function graphify(o, base, parentProfile){
	if(!o.id) var o=o.ref();
	return o.graphify(parentProfile);
}
exports.graphify = graphify;

function graphifyObject(aliasmap){
	var o = this;
	var graph = env.createGraph();
	var profile = env.createProfile();
	//profile.importProfile(env);
	defaults.loadRequiredPrefixMap(profile);
	if(o.aliasmap) profile.importProfile(o.aliasmap, true);
	if(aliasmap) profile.importProfile(aliasmap, true);
	function res(term){
		// Terms with a hierarchical component are URIs
		var v;
		if((v=term.toString().indexOf(':'))!==-1 && term[v+1]==='/') return term;
		// If no hierarchial component, try to resolve a CURIE
		return profile.resolve(term.toString())||term;
	}
	function rnn(term){
		// Test if `term` is an RDFNode
		if(typeof term=='string') return term.substring(0,2)=='_:' ? new BlankNode(term) : env.createNamedNode(res(term));
		else return term;
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
					graph.add( env.createTriple(rnn(s1), rnn(prop(p1,profile)), rdfnil ) );
				} else {
					var bnode = env.createBlankNode();
					graph.add( env.createTriple(rnn(s1), rnn(prop(p1,profile)), bnode ) );
					o1.forEach( function(i,x) {
						graphify(bnode, rdffirst, i );
						var n = env.createBlankNode();
						graph.add( env.createTriple(bnode, env.createNamedNode(rdfrest), (x==o1.length-1) ? env.createNamedNode(rdfnil) : n ) );
						bnode = n;
					});
				}
			}
		} else if(id) {
			// o1 is an Object, add triple and child triples
			graph.add( env.createTriple(rnn(s1), rnn(prop(p1,profile)), rnn(id) ) );
			graph.merge( graphifyObject.call(o1, profile) );
		} else if(typeof o1=='string' || typeof o1=='object') {
			// o1 is a string (convert to NamedNode) or RDFNode (NamedNode, BlankNode, or Literal)
			graph.add( env.createTriple(rnn(s1), rnn(prop(p1,profile)), rnn(o1) ) );
		} else if(typeof o1=='number') {
			// o1 is something else (convert to Literal)
			graph.add( env.createTriple(rnn(s1), rnn(prop(p1,profile)), env.createLiteral(o1.toString(), null, xsdns('double')) ) );
		} else {
			throw new Error('Unknown type '+(typeof o1));
		}
	}
	if(typeof(id)=="object") throw new Error("Not an object: "+require('util').inspect(this));
	Object.keys(o).forEach(function(p) { graphify(o.id, p, o[p]) });
	return graph;
}

exports.ref = ref;
function ref(id) {
	var copy = {};
	for(var n in this) copy[n] = this[n];
	//var copy = Object.create(this);
	Object.defineProperties(copy, {
		'id': _( id ? (env.resolve(id)||id) : env.createBlankNode().toString() ),
		n3: _( function toN3(aliasmap, padding) {
			padding = padding||'\n\t';
			var outs = [];
			var o = this;
			// Determine the prefix/term profile this object is using
			var profile = env.createProfile();
			//profile.importProfile(env);
			defaults.loadRequiredPrefixMap(profile);
			if(o.aliasmap) profile.importProfile(o.aliasmap, true);
			if(aliasmap) profile.importProfile(aliasmap, true);
			// Go through each key and produce a predicate-object line
			Object.keys(this).forEach(function toN3_property(p) {
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
				var predicateString = shrink(p, profile);
				if(typeof val=='string'){
					// If the value is an IRI, or an object without an IRI, recurse
					outs.push( predicateString + ' ' + createNamedNodeFrom(val).n3() );
					return;
				}else if(typeof val=='number' || typeof val=='boolean'){
					// If the value is an IRI, or an object without an IRI, recurse
					outs.push( predicateString + ' ' + createTypedLiteralFrom(val).n3() );
					return;
				}else if(val && typeof val.nodeType=='function' && val.nodeType() == 'IRI'){
					// If the value is a NamedNode instance, use that
					outs.push( predicateString + ' ' + shrink(val.toString(), profile) );
					return;
				}else if(val && typeof val.id=='string'){
					// If the value is an object with an "id" property, use that as the object
					// Then don't forget to serialize the object out.
					var objectIRI = profile.shrink(prop(val.id, profile));
					var objectName = profile.shrink(objectIRI);
					var objectString = (objectName==objectIRI) ? env.createNamedNode(val).toNT() : objectName ;
					outs.push( predicateString + ' ' + objectString );
					return;
				}
				if(val && val.nodeType && typeof val.nodeType == 'IRI'){
					// If the value is an object, descend into the object and parse it?
					outs.push( predicateString + ' ' + val.n3() );
					return;
				}else if(Array.isArray(val)){
					//// Encode a Literal, or recursively encode the object and the statements in it.
					//outs.push( padding + (o.list?'':predicateString+' ') + val.n3(profile, padding+'\t') );
				}else{
					// Encode a Literal, or recursively encode the object and the statements in it.
					var valref = (typeof val.n3=='function') ? val : ref.call(val) ;
					outs.push( (o.list?'':predicateString+' ') + valref.n3(profile, padding+'\t') );
				}
			});
			if(id) return createNamedNodeFrom(this.id).n3() + padding + outs.join(";"+padding) + ' .';
			if(this.list) return '( '+outs.join(' ')+' )';
			return '[' + padding + outs.join(';'+padding+'') + padding + ']';
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
	return copy;
}

// All
exports.ObjectProperties = {
	equals: _(RDFNodeEquals),
	ref: _(ref),
};
exports.setObjectProperties = function setObjectProperties(o){
	Object.defineProperties(o, exports.ObjectProperties);
}

// String
exports.StringProperties = {
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
	termType: _getter( function() {
		if(this.substr(0,2) == '_:') return 'BlankNode';
		return 'NamedNode';
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
	toCanonical: _( function() { return this.n3() } ),
	profile: _(env),
};
exports.setStringProperties = function setStringProperties(o){
	Object.defineProperties(o, exports.StringProperties);
}

// Array
exports.ArrayProperties = {
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
	Object.defineProperties(o, exports.ArrayProperties);
}

// Boolean
exports.BooleanProperties = {
	datatype: _( xsdns("boolean") ),
	value: _getter(function(){return this;}),
	nodeType: _( function() { return "TypedLiteral"} ),
	termType: _getter( function() { return "Literal"} ),
	n3: _( function() { return this.valueOf() } ),
	toNT: _( function() { return '"' + this.valueOf() + '"' + "^^<" + this.datatype + '>' } ),
	toCanonical: _( function() { return this.toNT() } )
};
exports.setBooleanProperties = function setBooleanProperties(o){
	Object.defineProperties(o, exports.BooleanProperties);
}

// Date
exports.DateProperties = {
	datatype: _( xsdns("dateTime") ),
	value: _getter(function(){return this;}),
	nodeType: _( function() { return "TypedLiteral"} ),
	termType: _getter( function() { return "Literal"} ),
	n3: _( function() {
		if(!this.getTime()) return '"NaN"^^<' + xsdns('double') + '>';
		return '"' + this.getUTCFullYear()+'-' + pad(this.getUTCMonth()+1)+'-' + pad(this.getUTCDate())+'T'
		+ pad(this.getUTCHours())+':' + pad(this.getUTCMinutes())+':' + pad(this.getUTCSeconds())+'Z"^^<' + this.datatype + '>';
	}),
	toNT: _( function() { return this.n3() } ),
	toCanonical: _( function() { return this.n3() } )
}
exports.setDateProperties = function setDateProperties(o){
	Object.defineProperties(o, exports.DateProperties);
}

// Number
var INTEGER = new RegExp("^(-|\\+)?[0-9]+$", "");
var DOUBLE = new RegExp("^(-|\\+)?(([0-9]+\\.[0-9]*[eE]{1}(-|\\+)?[0-9]+)|(\\.[0-9]+[eE]{1}(-|\\+)?[0-9]+)|([0-9]+[eE]{1}(-|\\+)?[0-9]+))$", "");
var DECIMAL = new RegExp("^(-|\\+)?[0-9]*\\.[0-9]+?$", "");
exports.NumberProperties = {
	datatype: {
		configurable:true,
		enumerable:false,
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
	termType: _getter( function() { return "Literal"} ),
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
	Object.defineProperties(o, exports.NumberProperties);
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
}

// Sometimes the standard API context isn't global, and an Object in one context isn't an Object in another.
// For these cases, you'll need to call these functions by hand.
exports.unsetBuiltins = function unsetBuiltins(){
	function unsetOn(map, target){
		for(var n in map) if(target[n]===undefined) throw new Error('Builtin not set');
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
}
