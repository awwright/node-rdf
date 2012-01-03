// Usually we don't want to pollute the object space so this isn't called by default.
// Other times the context isn't global, and an Object in one context isn't an Object in another.
// For these cases, you'll need to call these functions by hand.
var Builtins = require('./Builtins.js');
Builtins.setObjectProperties(Object.prototype);
Builtins.setStringProperties(String.prototype);
Builtins.setArrayProperties(Array.prototype);
Builtins.setBooleanProperties(Boolean.prototype);
Builtins.setDateProperties(Date.prototype);
Builtins.setNumberProperties(Number.prototype);

