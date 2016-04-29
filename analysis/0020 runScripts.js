"use strict";
/**
 * run the given analysis scripts in order of their numbering
 *
 * scripts are given by just their number
 *
 */

// includes
var Fs          = require( 'fs' ),
    Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    runScripts  = require( './util/runScripts' );
    
// local settings
var localCfg = {
      moduleName: 'runScripts',
      moduleKey: '0020'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };  

// if no scripts have been set, end here
if( process.argv.length < 3 ) {
  
  log( 'no scripts given to execute', Log.ERROR );
  process.exit();
  
}

// get list of scripts to be executed
var requestedScripts = process.argv.slice( 2 );

// run the scripts
var scripts = runScripts({
  filter: (script) => {

    // get number of script
    var number = script.substr( 0, 4 );
    
    // compare against the given list
    if( requestedScripts.indexOf( number ) > -1 ){
      return true;
    } else {
      return false;
    }
    
  }
});

// run them all in waterfall
scripts.fail( function( e ){
          log( 'A fatal error occured: ' + e.message, Log.ERROR );
          console.log( e.stack );
        })
        .done();