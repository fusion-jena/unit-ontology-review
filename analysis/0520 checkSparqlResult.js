"use strict";
/**
 * check the results of extract data
 * - do all necessary files exist?
 * - do the contents of the files conform to the standard definition?
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    Structure= require( './config/structure.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'checkSparqlResults',
      moduleKey:  '0520'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };    


function checkSparqlResults() {
  
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();
  
  // files to check
  var files = OntoStore.getResultTypes();
  
  // collect results
  var results = {};
  
  for( var i=0; i<ontos.length; i++ ) {
    
    log( 'checking ' + ontos[i] );
    
    for( var j=0; j<files.length; j++ ) {
      
      try {
        
        // get the needed data
        var data = OntoStore.getData( ontos[i], files[j] );
        
        // skip empty results
        if( data.length < 1 ) {
          continue;
        }
        
        // shortcut
        var curStructure = Structure[ files[j] ];

        // collect all keys and count
        var counts = {};
        for (var d=0; d<data.length; d++) {
          Object.keys( data[d] )
                .forEach( (key) => {
                  counts[ key ] = counts[ key ] || 0;
                  counts[ key ] += 1;
                });
        }
        
        // check for superfluous properties
        var allKeys = new Set( Object.keys( counts ) );
        allKeys.forEach( (key) => {
          if( !(key in curStructure) ) {
            log( '   superflous property in ' + files[j] + ': ' + key, Log.ERROR );
          }            
        });

        // check for required properties
        var keys = Object.keys( curStructure );
        for( var k=0; k<keys.length; k++ ) {
          if( (curStructure[ keys[k] ] !== Structure['OPTIONAL'])
              && !allKeys.has(keys[k]) ) {
            log( '   missing property in ' + files[j] + ': ' + keys[k], Log.ERROR );
          }
          
        }
        
        // add to results
        results[ ontos[i] ] = results[ ontos[i] ] || {};
        results[ ontos[i] ][ files[j] ] = counts;
        results[ ontos[i] ][ files[j] ]._total = data.length;
        
        
      } catch( e ){
        
        log( '   missing file: ' + files[j], Log.ERROR );
        
      }

    }
  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );
  
  return Q( true );    

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkSparqlResults().done(); 
} else { 
  module.exports = checkSparqlResults; 
}