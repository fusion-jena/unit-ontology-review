"use strict";
/**
 * run all analysis scripts in order of their numbering
 *
 * optional parameter is the prefix of the first script to execute
 * 
 * (a script always has to start with 4 digits and end in .js)
 */

// includes
var Fs          = require( 'fs' ),
    Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    runScripts  = require( './util/runScripts' ),
    Cfg         = require( './config/config' );
    
// local settings
var localCfg = {
      moduleName: 'runAllScripts',
      moduleKey: '0000'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };  
    
// set up the script run
var scripts;

// if a start script has been set, remove all before
if( process.argv.length > 2 ) {

  // script name (prefix is enough)
  var startscript = process.argv[2];
  
  scripts = runScripts({
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
  
}

// if no startscript has been set, we execute all
// but before, we clean the old results
if( process.argv.length < 3 ) {
  
  // clear the result directory
  // https://gist.github.com/liangzan/807712#gistcomment-1350457
  var rmDir = function(dirPath, removeSelf) {

    if (removeSelf === undefined)
      removeSelf = true;
    var files = Fs.readdirSync(dirPath);

    if (files.length > 0)
      for (var i = 0; i < files.length; i++) {
        var filePath = dirPath + '/' + files[i];
        if (Fs.statSync(filePath).isFile())
          Fs.unlinkSync(filePath);
        else
          rmDir(filePath);
      }
    if (removeSelf)
      Fs.rmdirSync(dirPath);
  };
  rmDir( Cfg.targetPath, false );
  log( '   removed all result files' );
  
  // run all scripts
  scripts = runScripts();

}


// run them all in waterfall
scripts.fail( function( e ){
          log( 'A fatal error occured: ' + e.message, Log.ERROR );
          console.log( e.stack );
        })
        .done();