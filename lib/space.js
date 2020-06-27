"use strict";

function xsdns(v){ return 'http://www.w3.org/2001/XMLSchema#'.concat(v); }

exports.stringConverter = function stringConverter(value, inputType) {
	return new String(value).valueOf();
};
exports.booleanConverter = function booleanConverter(value, inputType) {
	switch(value){
		case "false":case "0": return false;
		case "true":case "1": return true;
	}
	return(new Boolean(value)).valueOf();
};
exports.numberConverter = function numberConverter(value, inputType) {
	return(new Number(value)).valueOf();
};
exports.floatConverter = function floatConverter(value, inputType) {
	switch(value){
		case "INF": return Number.POSITIVE_INFINITY;
		case "-INF": return Number.NEGATIVE_INFINITY;
		default: return exports.numberConverter(value, inputType);
	}
};
exports.dateConverter = function dateConverter(value, inputType) {
	return new Date(value);
};

exports.loadDefaultTypeConverters = function(context){
	context.registerTypeConversion(xsdns("string"), exports.stringConverter);
	context.registerTypeConversion(xsdns("boolean"), exports.booleanConverter);
	context.registerTypeConversion(xsdns("float"), exports.floatConverter);
	context.registerTypeConversion(xsdns("integer"), exports.numberConverter);
	context.registerTypeConversion(xsdns("long"), exports.numberConverter);
	context.registerTypeConversion(xsdns("double"), exports.numberConverter);
	context.registerTypeConversion(xsdns("decimal"), exports.numberConverter);
	context.registerTypeConversion(xsdns("nonPositiveInteger"), exports.numberConverter);
	context.registerTypeConversion(xsdns("nonNegativeInteger"), exports.numberConverter);
	context.registerTypeConversion(xsdns("negativeInteger"), exports.numberConverter);
	context.registerTypeConversion(xsdns("int"), exports.numberConverter);
	context.registerTypeConversion(xsdns("unsignedLong"), exports.numberConverter);
	context.registerTypeConversion(xsdns("positiveInteger"), exports.numberConverter);
	context.registerTypeConversion(xsdns("short"), exports.numberConverter);
	context.registerTypeConversion(xsdns("unsignedInt"), exports.numberConverter);
	context.registerTypeConversion(xsdns("byte"), exports.numberConverter);
	context.registerTypeConversion(xsdns("unsignedShort"), exports.numberConverter);
	context.registerTypeConversion(xsdns("unsignedByte"), exports.numberConverter);
	context.registerTypeConversion(xsdns("date"), exports.dateConverter);
	context.registerTypeConversion(xsdns("time"), exports.dateConverter);
	context.registerTypeConversion(xsdns("dateTime"), exports.dateConverter);
};
