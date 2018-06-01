"use strict";

function xsdns(v){ return 'http://www.w3.org/2001/XMLSchema#'.concat(v) }
exports.loadDefaultTypeConverters = function(context){
	var stringConverter = function(value, inputType) { return new String(value).valueOf() };
	context.registerTypeConversion(xsdns("string"), stringConverter);
	var booleanConverter = function(value, inputType) { switch(value){case "false":case "0":return false;} return(new Boolean(value)).valueOf() };
	context.registerTypeConversion(xsdns("boolean"), booleanConverter);
	var numberConverter = function(value, inputType) { return(new Number(value)).valueOf() };
	var floatConverter = function(value, inputType) {
		switch(value){
			case "INF": return Number.POSITIVE_INFINITY;
			case "-INF": return Number.NEGATIVE_INFINITY;
			default: return numberConverter(value, inputType);
		};
	};
	context.registerTypeConversion(xsdns("float"), floatConverter);
	context.registerTypeConversion(xsdns("integer"), numberConverter);
	context.registerTypeConversion(xsdns("long"), numberConverter);
	context.registerTypeConversion(xsdns("double"), numberConverter);
	context.registerTypeConversion(xsdns("decimal"), numberConverter);
	context.registerTypeConversion(xsdns("nonPositiveInteger"), numberConverter);
	context.registerTypeConversion(xsdns("nonNegativeInteger"), numberConverter);
	context.registerTypeConversion(xsdns("negativeInteger"), numberConverter);
	context.registerTypeConversion(xsdns("int"), numberConverter);
	context.registerTypeConversion(xsdns("unsignedLong"), numberConverter);
	context.registerTypeConversion(xsdns("positiveInteger"), numberConverter);
	context.registerTypeConversion(xsdns("short"), numberConverter);
	context.registerTypeConversion(xsdns("unsignedInt"), numberConverter);
	context.registerTypeConversion(xsdns("byte"), numberConverter);
	context.registerTypeConversion(xsdns("unsignedShort"), numberConverter);
	context.registerTypeConversion(xsdns("unsignedByte"), numberConverter);
	var dateConverter = function(value, inputType) { return new Date(value) };
	context.registerTypeConversion(xsdns("date"), dateConverter);
	context.registerTypeConversion(xsdns("time"), dateConverter);
	context.registerTypeConversion(xsdns("dateTime"), dateConverter);
};
