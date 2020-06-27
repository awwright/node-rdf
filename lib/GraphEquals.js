"use strict";

module.exports = GraphEquals;
function GraphEquals(a, b, depth){
	if(typeof a.length!='number') throw new Error('Expected an RDFGraph for argument `a`');
	if(typeof b.length!='number') throw new Error('Expected an RDFGraph for argument `b`');
	if(a.length!==b.length) return false;
	if(a.length<=0) throw new Error('Expected a nonempty RDFGraph');
	var al = a.toArray();
	var bl = b.toArray();
	//if(!a.every(function(s))) return false;
	var stack = [ {i:0, depth:0, bindings:{}} ];
	// Iterate through each statement in `a`
	// test that named nodes/literals/bound bnodes have a match in the other document
	// For each bnode encountered in the statement that's unbound, determine every possible binding and recurse
	while(stack.length){
		// If `depth` starts as 0 this will never be hit
		if(--depth===0) throw new Error('Hit search limit');
		var state = stack.pop();
		if(state.i===al.length) return state.bindings;
		var stmt = al[state.i];
		// If it's a bnode, then map it. If it's not mapped, use `null` to search for any values.
		// in theory the predicate will never be a bnode, but the additional test shouldn't hurt anything
		var stmtsubject = stmt.subject.nodeType()==='BlankNode' ? (state.bindings[stmt.subject] || null) : stmt.subject ;
		var stmtpredicate = stmt.predicate.nodeType()==='BlankNode' ? (state.bindings[stmt.predicate] || null) : stmt.predicate ;
		var stmtobject = stmt.object.nodeType()==='BlankNode' ? (state.bindings[stmt.object] || null) : stmt.object ;
		var matches = b.match(stmtsubject, stmtpredicate, stmtobject).filter(function(m){
			// wildcards must only match bnodes
			// The predicate should never be a bnode, so skip over that code path for now
			if(stmtsubject===null && m.subject.nodeType()!=='BlankNode') return false;
			//if(stmtpredicate===null && m.predicate.nodeType()!=='BlankNode') return false;
			if(stmtobject===null && m.object.nodeType()!=='BlankNode') return false;
			return true;
		});
		if(stmtsubject && stmtpredicate && stmtobject){
			if(matches.length===1){
				// if there's a single match where all nodes match exactly, push the comparison for the next item
				stack.push({ i:state.i+1, depth:state.depth, bindings:state.bindings });
			}else if(matches.length===0){
				continue;
			}else{
				throw new Error('Multiple matches, expected exactly one or zero match');
			}
		}else{
			// otherwise there's an unbound bnode, get the possible mappings and push those onto the stack
			matches.forEach(function(match){
				var b2 = {};
				var depth = state.depth;
				for(var n in state.bindings) b2[n] = state.bindings[n];
				if(stmtsubject===null){
					if(b2[stmt.subject]===undefined){
						for(var n in b2) if(b2[n]===match.subject) return;
						b2[stmt.subject] = match.subject;
						depth++;
					}else{
						throw new Error('bnode already mapped');
					}
				}
				// if(stmtpredicate===null && b2[stmt.predicate]===undefined){
				// 	if(b2[stmt.predicate]===undefined){
				// 		for(var n in b2) if(b2[n]===match.predicate) return;
				// 		b2[stmt.predicate] = match.predicate;
				// 		depth++;
				// 	}else{
				// 		throw new Error('bnode already mapped');
				// 	}
				// }
				if(stmtobject===null){
					if(b2[stmt.object]===undefined){
						for(var n in b2) if(b2[n]===match.object) return;
						b2[stmt.object] = match.object;
						depth++;
					}else{
						throw new Error('bnode already mapped');
					}
				}
				stack.push({ i:state.i, depth:depth, bindings:b2 });
			});
		}
	}
}
