#!/usr/bin/env node

var fs = require('fs');

var parse = require('./../index.js').parse;
var TurtleParser = require('rdf').TurtleParser;
var rdfenv = require('rdf').environment;

var files = process.argv.slice(2);
var baseURI = 'http://example.com/';

var graphii = files.map(function(filepath){
	try {
		//console.error(filepath);
		var inputContents = fs.readFileSync(filepath, 'UTF-8');
		var turtleParser = TurtleParser.parse(inputContents, baseURI);
		var outputGraph = turtleParser.graph;
		console.log(outputGraph.toArray().map(function(t){ return t.toString()+'\n'; }).join(''));
		return outputGraph;
	}catch(err){
		console.error(err.stack);
	}
});

var match = graphii[0].equals(graphii[1]);
if(match){
	console.log(match);
}else{
	console.error('No match');
	process.exit(1);
}
