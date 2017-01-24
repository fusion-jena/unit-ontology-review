"use strict";
/**
 * Create HTML output for used exotic characters
 *
 * example: using "no-break space" (#160) instead of plain spaces
 *
 * output:
 * - "check - exotic characters" ... list per character of labels using exotic characters
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'check - exotic characters',
      moduleKey:  '9650'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkExoticCharacters() {

  // get results
  var results = OntoStore.getResult( 'check - exotic characters' );

  // create output
  var out = [];
  for( var onto in results ) {

    out.push( '<h2><ul><li data-onto="' + onto + '">', onto, '</ul></h2><ul>' );

    for( var type in results[ onto ] ) {

      for( var charCode in results[ onto ][ type ] ) {

        out.push( '<li>', charCode, ': "', String.fromCharCode( charCode ), '"<ul>' );

        for( var uri of results[ onto ][ type ][ charCode ] ) {
          out.push( '<li data-onto="' + onto + '">', uri );
        }

        out.push( '</ul>' );

      }

    }

    out.push( '</ul>' );

  }

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('\n')
  });
  log( 'written output' );

  // done
  return Q( true );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkExoticCharacters().done();
} else {
  module.exports = checkExoticCharacters;
}