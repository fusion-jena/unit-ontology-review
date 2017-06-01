"use strict";
/**
 * check, whether there are duplicate dimension vectors within one ontology
 *
 * output:
 * "check - duplicated dimVector" ... list of dimensions with identical dimension vectors
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'check - duplicated dimVector',
      moduleKey:  '3000'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    dimElems = [ 'dimLength', 'dimMass', 'dimTime', 'dimElec', 'dimThermo', 'dimAmount', 'dimLum' ];


function checkDuplicatedDimVector() {

  log( 'checking dimensions' );

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // duplicates
  var dups = [];

  for( var i=0; i<ontos.length; i++ ) {

    log( 'checking ' + ontos[i] );

    // lookup of dimensions
    var lookup = {};

    // get dimension list
    var dims = OntoStore.getData( ontos[i], 'dimension' );

    for( var j=0; j<dims.length; j++ ) {

      // hash for the respective dimension vector
      var hash = '',
          hashSet = false;

      // build the hash
      for( var k=0; k<dimElems.length; k++ ){
        if( dimElems[k] in dims[j] ) {
          hash += +dims[j][ dimElems[k] ];
          hashSet = true;
        } else {
          hash += '0';
        }
      }

      // if we have a hash at all, put in the lookup
      if( hashSet ) {
        lookup[ hash ] = lookup[ hash ] || new Set();
        lookup[ hash ].add( dims[j].dimension );
      }

    }

    // check the lookup for duplicates
    var keys = Object.keys( lookup );
    for( var j=0; j<keys.length; j++ ) {
      if( lookup[ keys[j] ].size > 1 ) {
        dups.push( lookup[ keys[j] ] )
        log( '   found possible duplicate(s): ' + JSON.stringify( [ ... lookup[ keys[j] ] ] ), Log.WARNING );
      }
    }

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, dups );

  // log, if needed again
  if( dups.length > 0 ) {
    log( 'some possible duplicate(s) found; see logs for details', Log.WARNING );
  }

  log( '... done' );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkDuplicatedDimVector().done();
} else {
  module.exports = checkDuplicatedDimVector;
}