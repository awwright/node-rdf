"use strict";

/** Implements interfaces from http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/ */

var api = exports;

var NamedNode = require("./RDFNode.js").NamedNode;

api.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");

// This is the same as the XML NCName
// Note how [\uD800-\uDBFF][\uDC00-\uDFFF] is a surrogate pair that encodes #x10000-#xEFFFF
api.CURIE_PREFIX = new RegExp("^([A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])([A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD.0-9\u00B7\u0300-\u036F\u203F-\u2040\\-]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$", "i");


// For implementations that don't have Map defined...???
function GoodEnoughMap(){
	this.map = {};
}
GoodEnoughMap.prototype.has = function has(key){
	return Object.hasOwnProperty.call(this.map, key+':');
};
GoodEnoughMap.prototype.get = function get(key){
	return Object.hasOwnProperty.call(this.map, key+':') ? this.map[key+':'] : undefined;
};
GoodEnoughMap.prototype.set = function set(key, value){
	// Store with some suffix to avoid certain magic keywords
	this.map[key+':'] = value;
};
GoodEnoughMap.prototype.delete = function del(key){
	delete this.map[key+':'];
};
GoodEnoughMap.prototype.forEach = function forEach(it){
	var map = this.map;
	Object.keys(this.map).forEach(function(k){
		it(map[k], k.substring(0, k.length-1));
	});
};
var StringMap = (typeof Map=='function') ? Map : GoodEnoughMap ;

/**
 * Implements PrefixMap http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-PrefixMap
 */
api.PrefixMap = function PrefixMap(){
	this.prefixMap = new StringMap;
};
api.PrefixMap.prototype.get = function(prefix){
	// strip a trailing ":"
	if(prefix.slice(-1)==":") prefix=prefix.slice(0, -1);
	return this.prefixMap.get(prefix);
};
api.PrefixMap.prototype.set = function(prefix, iri){
	// strip a trailing ":"
	if(prefix.slice(-1)==":") prefix=prefix.slice(0, -1);
	if(typeof prefix!='string') throw new TypeError('Expected a string argument[0] `prefix`');
	if(iri===null) return void this.prefixMap.delete(prefix);
	if(typeof iri!='string') throw new TypeError('Expected a string argument[1] `iri`');
	if(prefix.length && !api.CURIE_PREFIX.exec(prefix)) throw new Error('Invalid prefix name');
	this.prefixMap.set(prefix, iri);
};
api.PrefixMap.prototype.list = function(){
	var list = [];
	this.prefixMap.forEach(function(expansion, prefix){
		list.push(prefix);
	});
	return list;
};
api.PrefixMap.prototype.remove = function(prefix){
	this.prefixMap.delete(prefix);
};
api.PrefixMap.prototype.resolve = function(curie){
	var index = curie.indexOf(":");
	if(index<0) return null;
	var prefix = curie.slice(0, index);
	var iri = this.get(prefix);
	if(!iri) return null;
	var resolved = iri.concat(curie.slice(index+1));
	if(resolved.match(api.SCHEME_MATCH)==null && this.base!=null){
		resolved = this.base.resolveReference(resolved);
	}
	return resolved.toString();
};
api.PrefixMap.prototype.shrink = function(uri) {
	if(typeof uri!='string') throw new TypeError('Expected string arguments[0] `uri`');
	var shrunk = uri;
	var matchedLen = '';
	this.prefixMap.forEach(function(expansion, prefix){
		if(uri.substr(0,expansion.length)==expansion && expansion.length>matchedLen){
			shrunk = prefix + ':' + uri.substring(expansion.length);
			matchedLen = expansion.length;
		}
	});
	return shrunk;
};
api.PrefixMap.prototype.setDefault = function(uri){
	this.set('', uri);
};
api.PrefixMap.prototype.addAll = function(prefixes, override){
	var localPrefixMap = this.prefixMap;
	if(override){
		prefixes.prefixMap.forEach(function(expansion, prefix){
			localPrefixMap.set(prefix, expansion);
		});
	}else{
		prefixes.prefixMap.forEach(function(expansion, prefix){
			if(!localPrefixMap.has(prefix)) localPrefixMap.set(prefix, expansion);
		});
	}
};

/**
 * Implements TermMap http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-TermMap
 */
api.TermMap = function TermMap(){
	this.termMap = new StringMap;
	this.vocabulary = null;
};
api.TermMap.prototype.get = function(term){
	return this.termMap.get(term);
};
api.TermMap.prototype.set = function(term, iri){
	if(typeof term!='string') throw new TypeError('Expected a string argument[0] `prefix`');
	if(iri===null) return void this.termMap.delete(term);
	if(typeof iri!='string') throw new TypeError('Expected a string argument[1] `iri`');
	if(!api.CURIE_PREFIX.exec(term)) throw new Error('Invalid term name');
	this.termMap.set(term, iri);
};
api.TermMap.prototype.list = function(){
	var list = [];
	this.termMap.forEach(function(definition, term){
		list.push(term);
	});
	return list;
};
api.TermMap.prototype.remove = function(term){
	this.termMap.delete(term);
};
api.TermMap.prototype.resolve = function(term){
	var expansion = this.termMap.get(term);
	if(typeof expansion=='string') return expansion;
	if(typeof this.vocabulary=='string') return this.vocabulary+term;
	return null;
};
api.TermMap.prototype.shrink = function(uri){
	var shrunk = uri;
	this.termMap.forEach(function(definition, term){
		if(uri==definition){
			shrunk = term;
		}
	});
	if(typeof this.vocabulary==='string' && uri.substring(0, this.vocabulary.length)===this.vocabulary){
		return uri.substring(this.vocabulary.length);
	}
	return shrunk;
};
api.TermMap.prototype.setDefault = function(uri){
	this.vocabulary = (uri==='') ? null : uri;
};
api.TermMap.prototype.addAll = function(terms, override){
	var termMap = this.termMap;
	if(override){
		terms.termMap.forEach(function(definition, term){
			termMap.set(term, definition);
		});
	}else{
		terms.termMap.forEach(function(definition, term){
			if(!termMap.has(term)) termMap.set(term, definition);
		});
	}
};

/**
 * Implements Profile http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Profile
 */
api.Profile = function Profile() {
	this.prefixes = new api.PrefixMap;
	this.terms = new api.TermMap;
};
api.Profile.prototype.resolve = function(toresolve){
	if(toresolve.indexOf(":")<0) return this.terms.resolve(toresolve);
	else return this.prefixes.resolve(toresolve);
};
api.Profile.prototype.setDefaultVocabulary = function(uri){
	this.terms.setDefault(uri);
};
api.Profile.prototype.setDefaultPrefix = function(uri){
	this.prefixes.setDefault(uri);
};
api.Profile.prototype.setTerm = function(term, uri){
	this.terms.set(term, uri);
};
api.Profile.prototype.setPrefix = function(prefix, uri){
	this.prefixes.set(prefix, uri);
};
api.Profile.prototype.shrink = function(uri){
	return this.terms.shrink(this.prefixes.shrink(uri));
};
api.Profile.prototype.importProfile = function(profile, override){
	this.prefixes.addAll(profile.prefixes, override);
	this.terms.addAll(profile.terms, override);
};
