"use strict";
/**
 * run all scripts
 *
 * param:
 * - filter     ... function to filter the complete script list upon
 * - filterAll  ... get the complete script list and filter upon that
 *                  the return value is than used as new script list
 * - log        ... callback for logging
 *
 */

//includes
var Fs  = require( 'fs' ),
    Q   = require( 'q' ),
    Log = require( './log.js' ),
    Cfg = require( './../config/config' );


module.exports = function runScripts( param ){

  // get list of analysis scripts
  var scripts = listFiles( __dirname + '/../' ).sort();

  // filter the 00 namespace from scripts
  scripts = scripts.filter( (name) => {
    if( name.substr( 0,2 ) == '00' ) {
      return false;
    } else {
      return true;
    }
  });

  // if param is set, filter accordingly
  if( param && ('filterAll' in param) ) {
    scripts = param.filterAll( scripts );
  }

  // if param is set, filter accordingly
  if( param && ('filter' in param) ) {
    scripts = scripts.filter( param.filter );
  }

  // run remaining scripts in waterfall
  return scripts.reduce( function( prevTask, script ){
    return prevTask.then(function(){
                      var module = require( __dirname + '/../' + script );
                      return module();
                    });
  }, Q(true) );


};


/**
* list of files in a given path
* - removes some files like, e.g., .gitignore
*/
function listFiles( path ) {

 // RegExp to check for analysis script files
 var analysisRegexp = /^[a0-9]\d{3}.*\.js$/i;

 // list all files and filter
 return Fs.readdirSync( path )
          .filter( function( file ){
            return (file.substr(0, 4) != '0000')     // not the current file
                   && analysisRegexp.test( file );   // but any other analysis file
          });
}