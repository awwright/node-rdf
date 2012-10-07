var test = require('./graph-test-lib.js');
var vows = require('vows');
var rdf = require('rdf');

vows.describe('IndexedGraph').addBatch(test(rdf.IndexedGraph)).export(module);
