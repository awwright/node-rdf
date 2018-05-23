var vows = require('vows');

var rdf = require('..');
var test = require('./graph-test-lib.js');

vows.describe('TripletGraph').addBatch(test(rdf.Graph)).export(module);
