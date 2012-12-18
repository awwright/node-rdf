/**
 * Read an RDF Collection and return it as an Array
 */
var rdfnil = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';
var rdffirst = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
var rdfrest = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';
exports.getCollection = function getCollection(subject){
	var collection=[], seen=[];
	var first, rest=subject;
	while(rest && rest!=rdfnil){
		first = this.match(rest, rdffirst).map(function(v){return v.object})[0];
		if(first===undefined) throw new Error('Collection <'+rest+'> is incomplete');
		if(seen.indexOf(rest)!==-1) throw new Error('Collection <'+rest+'> is circular');
		seen.push(rest);
		collection.push(first);
		rest = this.match(rest, rdfrest).map(function(v){return v.object})[0];
	}
	return collection;
}
