"use strict";
/**
 * count the entries per ontology result file
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'count',
      moduleKey: '6000'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    byUri = {
      'appArea': 'appArea',
      'dimension': 'dimension',
      'unit': 'unit',
      'system': 'system',
      'quantKind': 'quantKind'
    };


function count() {
  
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // cache results
  var results = {};
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXX plain result types XXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  // files to check
  var files = OntoStore.getResultTypes();
  
  for( var i=0; i<ontos.length; i++ ) {

    // logging
    log( 'counting in ' + ontos[i] );

    // check all results
    for( var j=0; j<files.length; j++ ) {
      
      try {
        
        // get data
        var data = OntoStore.getData( ontos[i], files[j] );
        
        // count
        var count;
        if( files[j] in byUri ) {
          
          // count the number of different URIs appearing
          var uris = new Set();
          for( var k=0; k<data.length; k++ ) {
            uris.add( data[k][ byUri[ files[j] ] ] );
          }
          count = uris.size;
          
        } else {
          
          // for the others just count the rows
          count = data.length;

        }
        
        // save counts
        results[ ontos[i] ] = results[ ontos[i] ] || {};
        results[ ontos[i] ][ files[j] ] = count;
        
        // log
        log( '   ' + files[j] + ': ' + count );

      } catch( e ){

        log( '   missing file: ' + files[j], Log.WARNING );
        
      }
      
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX persist XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  count().done(); 
} else { 
  module.exports = count; 
}