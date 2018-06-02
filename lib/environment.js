var RDFEnvironment = require("./RDFEnvironment.js").RDFEnvironment;
var env = exports.environment = new RDFEnvironment;
require('./Default.js').loadDefaultPrefixMap(env);
