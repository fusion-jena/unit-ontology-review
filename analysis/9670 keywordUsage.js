"use strict";
/**
 * Create HTML output for used keywords like "per" or "reciprocal"
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'keywordUsage',
      moduleKey:  '9670'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function keywordUsage() {

  // get results
  var results = OntoStore.getResult( 'keywordUsage' );
 
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Stats XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  // create output
  var out = [];
  for( var onto in results ) {
    
    out.push( '<h2><ul><li data-onto="', onto, '">', onto, '</ul></h2><ul>' );

    for( var serComb in results[ onto ] ) {

      // get involved keywords
      var keywords = JSON.parse( serComb );
      
      // add to output
      out.push( '<li>', keywords.join( ', ' ), ': ', results[ onto ][ serComb ].length );

    }
    
    out.push( '</ul>' );
    
  }
  
  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('')
  });
  log( 'written output for statistics' );
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Details XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  // create output
  var out = [];
  for( var onto in results ) {

    out.push( '<h2><ul><li data-onto="', onto, '">', onto, '</ul></h2><ul>' );

    for( var serComb in results[ onto ] ) {
      
      // get involved keywords
      var keywords = JSON.parse( serComb );
      
      // sort URIs
      var uris = results[ onto ][ serComb ].slice( 0 );
      uris.sort();

      // add to output
      out.push( '<li>', keywords.join( ', ' ), ': <ul data-collapsible="true">' );
      uris.forEach( (uri) => {
            out.push( '<li><a href="', uri, '">', uri, '</a>' );
          });
      out.push( '</ul>' );

    }
    
    out.push( '</ul>' );
    
  }
  
  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName + '_details', {
    content: out.join('')
  });
  log( 'written output for details' );
  
  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  keywordUsage().done(); 
} else { 
  module.exports = keywordUsage; 
}