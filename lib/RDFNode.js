var api = exports;

/**
* RDFTriple
*/
api.RDFTriple = function(s, p, o) { this.subject = s; this.predicate = p; this.object = o; };
api.RDFTriple.prototype = {
	object: null, predicate: null, subject: null, size: 3, length: 3,
	toString: function() { return this.subject.toNT() + " " + this.predicate.toNT() + " " + this.object.toNT() + " ." },
	equals: function(t) { return this.subject.equals(t.subject) && this.predicate.equals(t.property) && this.object.equals(t.object) }
};
Object.defineProperty(api.RDFTriple.prototype, "property", { configurable:false, enumerable:false, get:function(){return this.predicate;} });

/**
 * RDFNode
 */
api.RDFNode = function() {};
api.RDFNode.prototype = {
	value: null,
	equals: function(other) {
		if( this.nodeType() != other.nodeType() ) return false;
		switch(this.nodeType()) {
			case "IRI":
			case "BlankNode":
				return this.value == other.value;
			case "PlainLiteral":
				return this.language == other.language && this.value == other.value;
			case "TypedLiteral":
				return this.type.equals(other.type) && this.value == other.value;
		}
		return this.toNT() == other.toNT()
	},
	nodeType: function() { return "RDFNode" },
	toNT: function() { return "" },
	toCanonical: function() { return this.toNT() },
	toString: function() { return this.value },
	encodeString: function(s) {
		var out = "";
		var skip = false;
		var _g1 = 0, _g = s.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(!skip) {
				var code = s.charCodeAt(i);
				if(55296 <= code && code <= 56319) {
					var low = s.charCodeAt(i + 1);
					code = (code - 55296) * 1024 + (low - 56320) + 65536;
					skip = true
				}
				if(code > 1114111) { throw new Error("Char out of range"); }
				var hex = "00000000".concat((new Number(code)).toString(16).toUpperCase());
				if(code >= 65536) {
					out += "\\U" + hex.slice(-8)
				} else {
					if(code >= 127 || code <= 31) {
						switch(code) {
							case 9:	out += "\\t"; break;
							case 10: out += "\\n"; break;
							case 13: out += "\\r"; break;
							default: out += "\\u" + hex.slice(-4); break
						}
					} else {
						switch(code) {
							case 34: out += '\\"'; break;
							case 92: out += "\\\\"; break;
							default: out += s.charAt(i); break
						}
					}
				}
			} else {
				skip = !skip
			}
		}
		return out
	}
};

/**
 * BlankNode
 */
api.BlankNode = function() { this.value = "_:b" + (new String(++api.BlankNode.NEXTID)).toString() };
api.BlankNode.NEXTID = 0;
api.BlankNode.prototype = {
	__proto__: api.RDFNode.prototype,
	nodeType: function() { return "BlankNode"; },
	toNT: function() { return this.value; }
};

/**
 * PlainLiteral
 */
api.PlainLiteral = function(value, language) {
	if(typeof language == "string" && language[0] == "@") language = language.slice(1);
	this.value = value;
	this.language = language||"";
};
api.PlainLiteral.prototype = {
	__proto__: api.RDFNode.prototype,
	language: null,
	nodeType: function() { return "PlainLiteral" },
	toNT: function() {
		var string = '"' + this.encodeString(this.value) + '"';
		return !Boolean(this.language).valueOf() ? string : string.concat("@" + this.language)
	},
	n3: function() { return this.toNT() }
};

/**
 * TypedLiteral
 */
api.TypedLiteral = function(value, type) { this.value = value; this.type = type };
api.TypedLiteral.prototype = {
	__proto__: api.RDFNode.prototype,
	type: null,
	nodeType: function() { return "TypedLiteral"; },
	toNT: function() { return '"' + this.encodeString(this.value) + '"^^<' + this.type + ">"; },
	n3: function() { return this.toNT() }
};

/**
 * IRI
 */
api.IRI = function(iri) { this.value = iri };
api.IRI.SCHEME_MATCH = new RegExp("^[a-z0-9-.+]+:", "i");
api.IRI.prototype = {
	__proto__: api.RDFNode.prototype,
	nodeType: function() { return "IRI" },
	toNT: function() { return"<" + this.encodeString(this.value) + ">" },
	n3: function() { return this.toNT(); },
	defrag: function() {
		var i = this.value.indexOf("#");
		return (i < 0) ? this : new api.IRI(this.value.slice(0, i))
	},
	isAbsolute: function() {
		return this.scheme() != null && this.heirpart() != null && this.fragment() == null
	},
	toAbsolute: function() {
		if(this.scheme() == null && this.heirpart() == null) { throw new Error("IRI must have a scheme and a heirpart!"); }
		return this.resolveReference(this.value).defrag()
	},
	authority: function() {
		var heirpart = this.heirpart();
		if(heirpart.substring(0, 2) != "//") { return null }
		var authority = heirpart.slice(2);
		var q = authority.indexOf("/");
		return q >= 0 ? authority.substring(0, q) : authority
	},
	fragment: function() {
		var i = this.value.indexOf("#");
		return (i < 0) ? null : this.value.slice(i)
	},
	heirpart: function() {
		var heirpart = this.value;
		var q = heirpart.indexOf("?");
		if(q >= 0) {
			heirpart = heirpart.substring(0, q)
		} else {
			q = heirpart.indexOf("#");
			if(q >= 0) { heirpart = heirpart.substring(0, q) }
		}
		var q2 = this.scheme();
		if(q2 != null) { heirpart = heirpart.slice(1 + q2.length) }
		return heirpart
	},
	host: function() {
		var host = this.authority();
		var q = host.indexOf("@");
		if(q >= 0) { host = host.slice(++q) }
		if(host.indexOf("[") == 0) {
			q = host.indexOf("]");
			if(q > 0) {	return host.substring(0, q) }
		}
		q = host.lastIndexOf(":");
		return q >= 0 ? host.substring(0, q) : host
	},
	path: function() {
		var q = this.authority();
		if(q == null) { return this.heirpart() }
		return this.heirpart().slice(q.length + 2)
	},
	port: function() {
		var host = this.authority();
		var q = host.indexOf("@");
		if(q >= 0) { host = host.slice(++q) }
		if(host.indexOf("[") == 0) {
			q = host.indexOf("]");
			if(q > 0) { return host.substring(0, q) }
		}
		q = host.lastIndexOf(":");
		if(q < 0) { return null }
		host = host.slice(++q);
		return host.length == 0 ? null : host
	},
	query: function() {
		var q = this.value.indexOf("?");
		if(q < 0) { return null }
		var f = this.value.indexOf("#");
		if(f < 0) { return this.value.slice(q) }
		return this.value.substring(q, f)
	},
	removeDotSegments: function(input) {
		var output = "";
		var q = 0;
		while(input.length > 0) {
			if(input.substr(0, 3) == "../" || input.substr(0, 2) == "./") {
				input = input.slice(input.indexOf("/"))
			}else {
				if(input == "/.") {
					input = "/"
				}else {
					if(input.substr(0, 3) == "/./") {
						input = input.slice(2)
					}else {
						if(input.substr(0, 4) == "/../" || input == "/..") {
							(input == "/..") ? input = "/" : input = input.slice(3);
							q = output.lastIndexOf("/");
							(q >= 0) ? output = output.substring(0, q) : output = "";
						}else {
							if(input.substr(0, 2) == ".." || input.substr(0, 1) == ".") {
								input = input.slice(input.indexOf("."));
								q = input.indexOf(".");
								if(q >= 0) { input = input.slice(q) }
							}else {
								if(input.substr(0, 1) == "/") {
									output += "/";
									input = input.slice(1)
								}
								q = input.indexOf("/");
								if(q < 0) {
									output += input;
									input = ""
								}else {
									output += input.substring(0, q);
									input = input.slice(q)
								}
							}
						}
					}
				}
			}
		}
		return output
	},
	resolveReference: function(ref) {
		var reference;
		if(typeof ref == "string") {
			reference = new api.IRI(ref)
		}else if(ref.nodeType && ref.nodeType() == "IRI") {
			reference = ref
		}else {
			throw new Error("Expected IRI or String");
		}
		var T = {scheme:"", authority:"", path:"", query:"", fragment:""};
		var q = "";
		if(reference.scheme() != null) {
			T.scheme = reference.scheme();
			q = reference.authority();
			T.authority += q != null ? "//" + q : "";
			T.path = this.removeDotSegments(reference.path());
			q = reference.query();
			T.query += q != null ? q : ""
		}else {
			q = reference.authority();
			if(q != null) {
				T.authority = q != null ? "//" + q : "";
				T.path = this.removeDotSegments(reference.path());
				q = reference.query();
				T.query += q != null ? q : ""
			}else {
				q = reference.path();
				if(q == "" || q == null) {
					T.path = this.path();
					q = reference.query();
					if(q != null) {
						T.query += q
					}else {
						q = this.query();
						T.query += q != null ? q : ""
					}
				}else {
					if(q.substring(0, 1) == "/") {
						T.path = this.removeDotSegments(q)
					}else {
						if(this.path() != null) {
							var q2 = this.path().lastIndexOf("/");
							if(q2 >= 0) {
								T.path = this.path().substring(0, ++q2)
							}
							T.path += reference.path()
						}else {
							T.path = "/" + q
						}
						T.path = this.removeDotSegments(T.path)
					}
					q = reference.query();
					T.query += q != null ? q : ""
				}
				q = this.authority();
				T.authority = q != null ? "//" + q : ""
			}
			T.scheme = this.scheme()
		}
		q = reference.fragment();
		T.fragment = q != null ? q : "";
		return new api.IRI(T.scheme + ":" + T.authority + T.path + T.query + T.fragment)
	},
	scheme: function() {
		var scheme = this.value.match(api.IRI.SCHEME_MATCH);
		return (scheme == null) ? null : scheme.shift().slice(0, -1)
	},
	userinfo: function() {
		var authority = this.authority();
		var q = authority.indexOf("@");
		return (q < 0) ? null : authority.substring(0, q)
	}
};
/**/
