/** Implements interfaces from http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/ */

var api = exports;

var NamedNode = require("./RDFNode.js").NamedNode;

api.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");


/**
 * Implements PrefixMap http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-PrefixMap
 */
api.PrefixMap = function PrefixMap(){
	
}
api.PrefixMap.prototype.get = function(prefix){
	// strip a trailing ":"
	if(prefix.slice(-1)==":") prefix=prefix.slice(0, -1);
	if(Object.hasOwnProperty.call(this, prefix)) return this[prefix];
}
api.PrefixMap.prototype.set = function(prefix, uri){
	// strip a trailing ":"
	if(prefix.slice(-1)==":") prefix=prefix.slice(0, -1);
	this[prefix] = uri;
}
api.PrefixMap.prototype.remove = function(toResolve){
	if(Object.hasOwnProperty.call(this, prefix)) delete this[prefix];
}
api.PrefixMap.prototype.resolve = function(curie){
	var index = curie.indexOf(":");
	if(index<0) return null;
	var prefix = curie.slice(0, index);
	var iri = this[prefix];
	if(!iri) return null;
	var resolved = iri.concat(curie.slice(++index));
	if(resolved.match(api.SCHEME_MATCH)==null && this.base!=null){ resolved = this.base.resolveReference(resolved) }
	return resolved.toString();
}
api.PrefixMap.prototype.shrink = function(uri) {
	for(prefix in this)
		if(Object.hasOwnProperty.call(this, prefix) && uri.substr(0,this[prefix].length)==this[prefix])
			return prefix + ':' + uri.slice(this[prefix].length);
	return uri;
}
api.PrefixMap.prototype.setDefault = function(uri){
	this.set('', uri);
}
api.PrefixMap.prototype.addAll = function(prefixes, override){
	if(override) for(var n in prefixes) this.set(n, prefixes[n]);
	else for(var n in prefixes) if(!Object.hasOwnProperty.call(this, n)) this.set(n, prefixes[n]);
}

/**
 * Implements TermMap http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-TermMap
 */
api.TermMap = function TermMap(){

}
api.TermMap.prototype.get = function(term){
	if(Object.hasOwnProperty.call(this, term)) return this[term];
}
api.TermMap.prototype.set = function(term, uri){
	this[term] = uri;
}
api.TermMap.prototype.remove = function(term){
	if(Object.hasOwnProperty.call(this, prefix)) delete this[prefix];
}
api.TermMap.prototype.resolve = function(term){
	if(Object.hasOwnProperty.call(this, term)) return this[term];
	return null;
}
api.TermMap.prototype.shrink = function(uri){
	for(term in this)
		if(Object.hasOwnProperty.call(this, term) && uri==this[term])
			return term;
	return uri;
}
api.TermMap.prototype.setDefault = function(uri){
	this.set('', uri);
}
api.TermMap.prototype.addAll = function(terms, override){
	if(override) for(var n in terms) this.set(n, terms[n]);
	else for(var n in terms) if(!Object.hasOwnProperty.call(this, n)) this.set(n, terms[n]);
}


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
}
api.Profile.prototype.setDefaultVocabulary = function(uri){
	this.terms.setDefault(uri);
}
api.Profile.prototype.setDefaultPrefix = function(uri){
	this.prefixes.setDefault(uri);
}
api.Profile.prototype.setTerm = function(term, uri){
	this.terms.set(term, uri);
}
api.Profile.prototype.setPrefix = function(prefix, uri){
	this.prefixes.set(prefix, uri);
}
api.Profile.prototype.shrink = function(uri){
	return this.terms.shrink(this.prefixes.shrink(uri));
}
api.Profile.prototype.importProfile = function(profile, override){
	this.prefixes.addAll(profile.prefixes, override);
	this.terms.addAll(profile.terms, override);
}

// A possibly useful function for the future?
api.Profile.prototype._resolveType = function(type) {
	if(type.slice(0, 2) == "^^") { type = type.slice(2) }
	return this.resolve(type) || type;
}
