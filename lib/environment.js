var RDFEnvironment = require("./RDFEnvironment.js").RDFEnvironment;
var env = exports.environment = new RDFEnvironment;
require('./prefixes.js').loadDefaultPrefixMap(env);
