"use strict";
/**
 * Create HTML output for used exotic characters
 * 
 * example: using "no-break space" (#160) instead of plain spaces
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'exoticChars',
      moduleKey:  '9650'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function exoticChars() {

  // get results
  var results = OntoStore.getResult( 'exoticChars' );
 
  // create output
  var out = [];
  for( var onto in results ) {
    
    out.push( '<h2><ul><li data-onto="', onto, '">', onto, '</ul></h2><ul>' );

    for( var type in results[ onto ] ) {

      for( var charCode in results[ onto ][ type ] ) {
        
        out.push( '<li>', charCode, ': "', String.fromCharCode( charCode ), '"<ul>' );

        for( var uri of results[ onto ][ type ][ charCode ] ) {
          out.push( '<li data-onto="', onto, '">', uri );
        }
        
        out.push( '</ul>' );
        
      }

    }
    
    out.push( '</ul>' );
    
  }
  
  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('')
  });
  log( 'written output' );
  
  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  exoticChars().done(); 
} else { 
  module.exports = exoticChars; 
}