"use strict";
/**
 * find entities of a given ontology, that are not mapped to any other entity
 * may be typos at some point preventing the mapping
 * 
 */

// set input
const SOURCE = 'OM2';

// includes
const OntoStore = require( __dirname + '/../util/OntoStore' );

// get a list of types
const TYPES = OntoStore.getSemanticTypes()
                .map( (t) => {
                  return t[0].toUpperCase() + t.slice( 1 );
                });

// process each type
const result = {};
for( let type of TYPES ) {
  
  // get the respective dataset
  let data = OntoStore.getResult( 'map' + type );
  
  // init results
  result[ type ] = [];
  
  // walk through the data
  for( let synSet of data ) {
    
    // get synonyms
    let syns = synSet.getSynonyms();
    
    // we are just concerned with one-entity-SynSets
    if( syns.length > 1 ) {
      continue;
    }
    
    // get the respective SemObject
    let obj = syns[0];
    
    // we are just concerned with a single ontology
    if( obj.getOntology() != SOURCE ){
      continue;
    }
    
    // if we came this far, we got a hit
    result[ type ].push({
      uri:    obj.getURI(),
      label:  obj.getDisplayLabel()
    });
    
  }

}

// sort results
Object.keys( result )
      .forEach( (type) => {
        
        result[type].sort( (a,b) => a.uri.localeCompare( b.uri ) );
        
      })

// output result
console.log( JSON.stringify( result, null, 2 ) );