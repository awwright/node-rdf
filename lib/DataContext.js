var api = exports;
var defaults = require('./DefaultDataContext.js');

var IRI = require("./RDFNode.js").IRI;
var BlankNode = require("./RDFNode.js").BlankNode;
var PlainLiteral = require("./RDFNode.js").PlainLiteral;
var RDFTriple = require("./RDFNode.js").RDFTriple;
var TypedLiteral = require("./RDFNode.js").TypedLiteral;

/**
 * implements DataContext
 * An in-memory implementation
 */
api.DataContext = function() {
	this.curieMap = {};
	this.converterMap = {};
	defaults.loadDefaultPrefixMap(this);
	defaults.loadDefaultTypeConverters(this);
};
api.DataContext.prototype = {
	base: null, converterMap: null, curieMap: null,
	createBlankNode: function() { return new BlankNode },
	createIRI: function(iri) {
		var resolved = new IRI(iri);
		if(resolved.scheme()==null && this.base!=null) { resolved = this.base.resolveReference(resolved) }
		return resolved.value
	},
	createPlainLiteral: function(value, language) { return new PlainLiteral(value, language) },
	createTypedLiteral: function(value, type) {
		type = this._resolveType(type);
		if(type==this._resolveType("rdf:PlainLiteral")) return this.createPlainLiteral(value);
		return new TypedLiteral(value, type)
	},
	createTriple: function(s, p, o) { return new RDFTriple(s, p, o) },
	createGraph: function(a) { return new api.Graph(a) },
	
	getMapping: function() { return this.curieMap },
	setMapping: function(prefix, iri) {
		// strip a trailing ":"
		if(prefix.slice(-1)==":") { prefix = prefix.slice(0, -1) }
		//var prefixIRI = new IRI(iri);
		var prefixIRI = iri;
		this.curieMap[prefix.toLowerCase()] = prefixIRI;
		//return function(suffix) { return new IRI(prefixIRI.toString().concat(suffix)) }
		return function(suffix) { return prefixIRI.toString().concat(suffix); }
	},
	resolveCurie: function(curie) {
		var index = curie.indexOf(":");
		if(index<0) return null;
		var prefix = curie.slice(0, index).toLowerCase();
		var iri = this.curieMap[prefix];
		if(!iri) return null;
		//var resolved = new IRI(iri.value.concat(curie.slice(++index)));
		var resolved = new IRI(iri.concat(curie.slice(++index)));
		if(resolved.scheme()==null && this.base!=null){ resolved = this.base.resolveReference(resolved) }
		return resolved.toString();
	},
	
	convertType: function(tl) {
		var converter = this.converterMap[tl.type.toString()];
		if(converter) {
			try {
				return converter(tl.value, tl.type)
			} catch(e) { }
		}
		return tl;
	},
	registerTypeConversion: function(iri, converter) {
		this.converterMap[this._resolveType(iri)] = converter;
	},
	
	_resolveType: function(type) {
		if(type.slice(0, 2) == "^^") { type = type.slice(2) }
		return this.resolveCurie(type) || this.createIRI(type).value;
	}
};
