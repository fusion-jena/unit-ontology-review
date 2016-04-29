"use strict";
/**
 * Create HTML output for unit, which possibly lack a prefix annotation
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' ),
    buildLookup = require( './util/buildLookup' );

// local settings
var localCfg = {
      moduleName: 'unrecognizedPrefixedUnits',
      moduleKey:  '9110'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function unrecognizedPrefixedUnits() {
  
  // get unit lookup
  var units       = OntoStore.getResult( 'unit' ),
      unitLookup  = buildLookup( units );
  
  // get list of unrecognized prefixed units
  var unrecog = OntoStore.getResult( 'checkPrefixedHeuristic' );
  
  // build output
  var output = [];
  Object.keys( unrecog )
        .forEach( (onto) => {
          
          // extract used data
          var data = [ ... unrecog[ onto ] ]
                      .map( (uri) => {
                        
                        var obj = unitLookup[ uri ];
                        
                        return {
                          label: obj.getDisplayLabel(),
                          uri:   uri
                        };
                        
                      });
    
          // sort data by label
          data.sort( function( a, b ){
            return a.label.localeCompare( b.label );
          });
          
          // collect output parts
          var out = [ '<h2>', onto, ' (', data.length, ')</h2><ul>' ];
          for( var obj of data ) {            
            out.push( '<li data-onto="', onto, '"><a href="', obj.uri, '">', obj.label, '<br>(', obj.uri, ')</a>' );
          }
          out.push( '</ul>' );
                    
          // add to output
          Array.prototype.push.apply( output, out );
          
        });
  
  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: output.join('')
  });
  
  // log
  log( 'written output' );
  
  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  unrecognizedPrefixedUnits().done(); 
} else { 
  module.exports = unrecognizedPrefixedUnits; 
}