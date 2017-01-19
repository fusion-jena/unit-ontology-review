"use strict";
/**
 * check, whether there are URIs that are present in multiple types
 */

// includes
const Q        = require( 'q' ),
      Log      = require( './util/log.js' ),
      OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'multiple type assignments',
      moduleKey:  '1100'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function checkMultipleTypeAssignments() {

  log( 'checking for multiple types assignment' );

  // prepare results
  const resultsPerOntology = {};

  // get list of ontologies to check
  const ontos = OntoStore.getOntologies(),
  // as well as types
        types = OntoStore.getSemanticTypes();

  // check for each ontology
  for( var onto of ontos ) {

    // create a lookup from URI to respective type
    let lookup = {};
    
    // add data for all types
    for( let type of types ) {
      
      // get data
      let data = OntoStore.getData( onto, type );
      
      // add to lookup
      data
        .forEach( (entry) => {
          lookup[ entry[ type ] ] = lookup[ entry[ type ] ] || new Set();
          lookup[ entry[ type ] ].add( type );
        })
      
    }
    
    // look for duplicates
    let res = {};
    Object
      .keys( lookup )
      .forEach( (uri) => {
        if( lookup[ uri ].size > 1 ) {
          res[ uri ] = [ ... lookup[ uri ] ];
        }
      });
    
    // add to result
    resultsPerOntology[ onto ] = res;

    // logging
    log( '   ' + onto + ' - duplicate assigments found: ' + Object.keys( res ).length );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkMultipleTypeAssignments().done();
} else {
  module.exports = checkMultipleTypeAssignments;
}