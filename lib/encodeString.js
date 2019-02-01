"use strict";

// #x22#x5C#xA#xD
var encodeMap = {
	'"': '\\"',
	'\\': '\\\\',
	"\r": '\\r',
	"\n": '\\n',
	"\t": '\\t',
};

// Takes a string and produces an escaped Turtle String production but without quotes
module.exports = encodeASCIIString;

// Use this to output the unicode character whenever it's legal in N-Triples
// var encodeSearch = /["\r\n\\]/g;
// function encodeString(str) {
// 	return str.replace(encodeSearch, function(a, b){
// 		return encodeMap[b];
// 	});
// }

var encodeASCIIStringSearch = /(["\r\n\t\\])|([\u0080-\uD7FF\uE000-\uFFFF])|([\uD800-\uDBFF][\uDC00-\uDFFF])/g;
function encodeASCIIStringReplace(a, b, c, d){
	if(b){
		return encodeMap[b];
	}
	if(c){
		return '\\u'+('0000'+c.charCodeAt(0).toString(16).toUpperCase()).substr(-4);
	}
	if(d){
		var hig = d.charCodeAt(0);
		var low = d.charCodeAt(1);
		var code = (hig - 0xD800) * 0x400 + (low - 0xDC00) + 0x10000;
		return '\\U'+('00000000'+code.toString(16).toUpperCase()).substr(-8);
	}
}

// Return a Turtle string with backslash escapes for all non-7-bit characters
function encodeASCIIString(str){
	return str.replace(encodeASCIIStringSearch, encodeASCIIStringReplace);
}
