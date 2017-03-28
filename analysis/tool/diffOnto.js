"use strict";
/**
 * Compare two given ontologies
 * listing added/missing units etc
 * 
 */

// set input
const SOURCE = 'OM',
      TARGET = 'OM2';

// includes
const OntoStore = require( './../util/OntoStore' );

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
  result[ type ] = { added: [], removed: [] };
  
  // walk through the data
  for( let synSet of data ) {
    
    // get synonyms
    let syns = synSet.getSynonyms();
    
    // check, if both source and target are present
    let hasTarget = [],
        hasSource = [];
    for( let syn of syns ) {
      if (syn.getOntology() == TARGET){
        hasTarget.push( syn );
      };
      if (syn.getOntology() == SOURCE){
        hasSource.push( syn );
      }
    }
    
    // is there a difference?
    if( (hasTarget.length == 0) != (hasSource.length == 0) ) {
      
      // where to add
      let where = (hasTarget.length != 0)
                    ? result[ type ].added
                    : result[ type ].removed;

      // what to add
      let what  = (hasTarget.length != 0)
                    ? hasTarget
                    : hasSource;

      // add an entry
      where.push({
        label:  synSet.getDisplayLabel(),
        uris:   what.map( (e) => e.getURI() )
      });

    }
  }

}

// sort results
Object.keys( result )
      .forEach( (type) => {
        
        result[type].added.sort( (a,b) => a.uris[0].localeCompare( b.uris[0] ) );
        result[type].removed.sort( (a,b) => a.uris[0].localeCompare( b.uris[0] ) );
        
      })

// output result
console.log( JSON.stringify( result, null, 2 ) );