#!/usr/bin/env node

var fs = require('fs');

var TurtleParser = require('rdf').TurtleParser;
var rdfenv = require('rdf').environment;

var files = process.argv.slice(2);
var baseURI = 'http://example.com/';

files.forEach(function(filepath){
	try {
		//console.error(filepath);
		var inputContents = fs.readFileSync(filepath, 'UTF-8');
		var turtleParser = TurtleParser.parse(inputContents, baseURI);
		var outputGraph = turtleParser.graph;
		console.log(outputGraph.toArray().map(function(t){ return t.toString()+'\n'; }).join(''));
	}catch(err){
		console.error(err.stack);
	}
});
