var test = require('./graph-test-lib.js');
var vows = require('vows');
var rdf = require('rdf');

vows.describe('TripletGraph').addBatch(test(rdf.TripletGraph)).export(module);
