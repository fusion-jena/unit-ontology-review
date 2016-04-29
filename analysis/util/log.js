"use strict";
/**
 * unified logging schema including date and source
 */

function log( src, msg, type ){
  
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
    msg = colored( msg, color );
  }
  
  console.log( now, colored( '[' + src + ']', 'bold' ), msg );
  
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