"use strict";
/**
 * find exotic characters
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    Structure= require( './config/structure' );

// local settings
var localCfg = {
      moduleName: 'exoticChars',
      moduleKey:  '1650'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    testChars = [ /[^\S ]/ ];
   

function exoticChars() {
  
  log( 'searching for exotic keys in labels' );
  log( '   #listed test-patterns: ' + testChars.length );
  
  // find datasets with labels
  log( '   searching for datasets with labels' );
  var types = Object.keys( Structure )
                     .filter( (key) => {
                       return 'label' in Structure[ key ];
                     });
  log( '      found: ' + types );
  
  // prepare results
  var results = {};
 
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {
    
    // log
    log( '   processing ' + onto );
    
    // count findings
    var count = 0;
    
    for( var type of types) {
      
      // load data
      var data = OntoStore.getData( onto, type );

      // check each label
      for( var entry of data ){
        
        // skip, where label is missing
        if( !('label' in entry) ) { 
          continue;
        }

        // get label
        var label = entry.label;
        
        // check
        for( var char of testChars ) {
          
          // check for existence
          var match = label.match( char );
          char.lastIndex = 0;
          
          if( match !== null ) {
            
            // which character actually matched?
            var code = match[0].charCodeAt( 0 );
            
            // store in results
            results[ onto ] = results[ onto ] || {};
            results[ onto ][ type ] = results[ onto ][ type ] || {};
            results[ onto ][ type ][ code ] = results[ onto ][ type ][ code ] || new Set();
            results[ onto ][ type ][ code ].add( entry[ type ] );
            count += 1;
          }
        }
        
      }
      
    }
    
    // convert all results from sets to arrays
    if( results[onto] ) {
      Object.keys( results[ onto ] )
            .forEach( (type) => {
              Object.keys( results[ onto ][ type ] )
                    .forEach( (code) => {
                      results[ onto ][ type ][ code ] = [ ... results[ onto ][ type ][ code ] ];
                    });
            });
    }

    // log
    log( '      found: ' + count );

  }
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  return Q( true );    

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  exoticChars().done(); 
} else { 
  module.exports = exoticChars; 
}