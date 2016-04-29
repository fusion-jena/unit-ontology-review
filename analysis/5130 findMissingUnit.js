"use strict";
/**
 * find "important" missing units in the ontologies
 * 
 * "important" is defined as "the unit is present in more than half the listed ontologies"
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

//local settings
var localCfg = {
    moduleKey: '5130',
    moduleName: 'findMissingUnit'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  },
  threshold = (function(){
    
    // get ontologies
    var ontos = OntoStore.getOntologies();
    
    // we need at least half
    return ontos.length / 2;
    
  })();

  
function findMissingUnit() {

  // log
  log( 'searching for missing units' );
  
  // get unit SynSets and build a lookup
  log( '   getting mapped units' );
  var units = OntoStore.getResult( 'mapUnit' )
  
  // get list of ontologies
  var ontos = OntoStore.getOntologies();
  
  // remember non-consistent conversions
  var missing = {};
  
  // process all conversions
  log( '   checking all unit SynSets' );
  for( var unit of units ) {
    
    // get synonyms
    var syns = unit.getSynonyms();
    
    // get involved ontologies
    var involved = new Set( syns.map( (syn) => syn.getOntology() ) );

    // we are not interested in units below threshold
    if( involved.size < threshold ) {
      continue;
    }
    
    // check presence of all ontologies
    for( var onto of ontos ) {
      if( !involved.has( onto ) ) {
        missing[ onto ] = missing[ onto ] || [];
        missing[ onto ].push( unit.getDisplayLabel() );
      }
    }

  }
  
  // log
  log( 'found missing' );
  for( var onto of Object.keys( missing ) ) {
    log( '   ' + onto + ': ' + missing[ onto ].length, Log.WARNING );
  }
  
  // save results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, missing );
  
  // done
  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  findMissingUnit().done(); 
} else { 
 module.exports = findMissingUnit; 
}