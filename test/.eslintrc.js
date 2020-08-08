"use strict";
module.exports = {
	"env": {
		"mocha": true,
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 5,
	},
	"rules": {
		"indent": [ "error", "tab", {
			SwitchCase: 1,
		} ],
		"no-unreachable": [ "error" ],
		"linebreak-style": [  "error", "unix" ],
		//"semi": [ "error", "always" ],
		"comma-dangle": [ "error", "always-multiline" ],
		"no-console": [ "error" ],
	},
};
