"use strict";

// includes
const Cfg = require( '../config/config' ),
      Fs  = require( 'fs' );

/**
 * unified logging schema including date and source
 */

function log( src, msg, type ){
  
  // variables
  let cmsg = msg;   // colored msg
  
  // format date
  var now = new Date().toISOString();

  // color message if needed
  if( type ) {
    var color;
    switch( type ) {
      case log.WARNING: color = 'yellow'; break;
      case log.ERROR:   color = 'red';    break;
      case log.MESSAGE: 
      default:          color = 'normal'; break;
    }
    cmsg = colored( msg, color );
  }
  
  // log to file, if enabled
  if( Cfg.logToFile ) {
    
    // build log String
    const entry = '<div style="white-space: pre; font-family: monospace;' 
                    + (
                        color 
                          ? 'background-color: ' + color + ';'
                          : ''
                      )
                    + '">'
                    + now
                    + ' [' + src + '] '
                    + msg
                    + '</div>\n';
    
    // append to log file
    Fs.appendFileSync( Cfg.logToFile, entry );
    
  }
  
  // log to console
  console.log( now, colored( '[' + src + ']', 'bold' ), cmsg );
  
};


// some constants
log.MESSAGE = 1;
log.WARNING = 2;
log.ERROR   = 3; 

/**
 * output colored input
 * @param input
 * @param color
 * @returns
 */
function colored( input, color ) {
  var codes = {
      'normal':   '\x1b[0m',
      'italic':   '\x1b[3m',
      'bold':     '\x1b[1m',
      'black':    '\x1b[90m',
      'red':      '\x1b[91m',
      'green':    '\x1b[92m',
      'yellow':   '\x1b[93m',
      'blue':     '\x1b[94m',
      'magenta':  '\x1b[95m',
      'cyan':     '\x1b[96m',
      'white':    '\x1b[97m'
    };

  if( color in codes ) {
    return codes[ color ] + input + codes.normal;
  } else {
    return input;
  }
}


module.exports = log;