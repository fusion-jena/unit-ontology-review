var OntoStore= require( '../util/OntoStore' );
// tests for addSynonym
var a = OntoStore.getEntity( "a", OntoStore.DIMENSION );
var b = OntoStore.getEntity( "b", OntoStore.DIMENSION );
a.addSynonym( b );
console.log("1a: " + a.getSynonyms() ); // expected: [b]
console.log("1b: " + b.getSynonyms() ); // expected: [a]
var c = OntoStore.getEntity( "c", OntoStore.DIMENSION );
c.addSynonym( b );
console.log("2a: " + a.getSynonyms() ); // expected: [b,c]
console.log("2b: " + b.getSynonyms() ); // expected: [a,c]
console.log("2c: " + a.getSynonyms() ); // expected: [a,b]
var d = OntoStore.getEntity( "d", OntoStore.DIMENSION );
var e = OntoStore.getEntity( "e", OntoStore.DIMENSION );
d.addSynonym( e );
console.log("2a: " + a.getSynonyms() ); // expected: [b,c]
console.log("2b: " + b.getSynonyms() ); // expected: [a,c]
console.log("2c: " + a.getSynonyms() ); // expected: [a,b]
console.log("2d: " + d.getSynonyms() ); // expected: [e]
console.log("2e: " + e.getSynonyms() ); // expected: [d]
a.addSynonym( d );
console.log("2a: " + a.getSynonyms() ); // expected: [b,c,d,e]
console.log("2b: " + b.getSynonyms() ); // expected: [a,c,d,e]
console.log("2c: " + a.getSynonyms() ); // expected: [a,b,d,e]
console.log("2d: " + d.getSynonyms() ); // expected: [a,b,c,e]
console.log("2e: " + e.getSynonyms() ); // expected: [a,b,c,d]
