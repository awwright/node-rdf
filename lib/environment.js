"use strict";

var RDFEnvironment = require("./RDFEnvironment.js").RDFEnvironment;
var DataFactory = require("./DataFactory.js").DataFactory;

var env = exports.environment = new RDFEnvironment;
require('./prefixes.js').loadDefaultPrefixMap(env);
exports.factory = new DataFactory;
