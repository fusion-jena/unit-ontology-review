"use strict";
/**
 * run all analysis scripts in order of their numbering
 *
 * starting with the given script (or prefix thereof)
 *
 */

// includes
var Fs          = require( 'fs' ),
    Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    runScripts  = require( './util/runScripts' );
    
// local settings
var localCfg = {
      moduleName: 'runFromScript',
      moduleKey: '0010'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };  

// if no start script has been set, end here
if( process.argv.length < 3 ) {
  
  log( 'no startscript or prefix given', Log.ERROR );
  process.exit();
  
}

// script name (prefix is enough)
var startscript = process.argv[2];

// run the scripts
var scripts = runScripts({
  filterAll: (scripts) => {

    // walk all scripts
    for( var i=0; i<scripts.length; i++ ) {

      if( scripts[i].indexOf( startscript ) == 0 ) {
        return scripts.slice( i );
      }
    }
    
    // start script not found, so run all
    log( '  didn\'t find script to start with; running all', Log.WARNING );
    return scripts;
  }
});

// run them all in waterfall
scripts.fail( function( e ){
          log( 'A fatal error occured: ' + e.message, Log.ERROR );
          console.log( e.stack );
        })
        .done();