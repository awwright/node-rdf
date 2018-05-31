"use strict";

// Takes a string and produces an escaped Turtle String production but without quotes
module.exports = function encodeString(str) {
	var out = "";
	for(var i=0; i<str.length; i++) {
		var code = str.charCodeAt(i);
		if(0xD800<=code && code<=0xDBFF) {
			var low = str.charCodeAt(i + 1);
			if(low>=0xDC00 && low<=0xDFFF){
				code = (code - 0xD800) * 0x400 + (low - 0xDC00) + 0x10000;
				++i;
			}
		}
		if(code > 0x10FFFF) { throw new Error("Char out of range"); }
		var hex = "00000000".concat((new Number(code)).toString(16).toUpperCase());
		if(code >= 0x10000) {
			out += "\\U" + hex.slice(-8);
		} else {
			if(code >= 0x7F || code <= 31) {
				switch(code) {
					case 0x09:	out += "\\t"; break;
					case 0x0A: out += "\\n"; break;
					case 0x0D: out += "\\r"; break;
					default: out += "\\u" + hex.slice(-4); break;
				}
			} else {
				switch(code) {
					case 0x22: out += '\\"'; break;
					case 0x5C: out += "\\\\"; break;
					default: out += str.charAt(i); break;
				}
			}
		}
	}
	return out;
}
