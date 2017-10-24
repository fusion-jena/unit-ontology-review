"use strict";
/**
 * find changed individuals between two extraction files in case files are to big for system's diff
 *
 * both given files have to be the result of the same concept's extraction!
 * 
 * input is 
 * - FILE1 ... source file for comparison
 * - FILE2 ... target file for comparison
 * - PROP  ... property to use as ID
 */

// includes
const Fs = require( 'fs' );

// set input
const FILE1 = 'C:\\tmp\\unit\\old.json',
      FILE2 = 'C:\\tmp\\unit\\new.json',
      PROP  = 'unit';

// retrieve distinct individuals from both files
const ind1 = getDistinct( FILE1, PROP ),
      ind2 = getDistinct( FILE2, PROP );

// added items
console.log( 'added: ' );
let diff = getDiff( ind1, ind2 );
[ ... diff ].sort()
            .forEach( (id) => console.log( '   ' + id ) );

// removed items
console.log( '\nremoved: ' );
diff = getDiff( ind2, ind1 );
[ ... diff ].sort()
            .forEach( (id) => console.log( '   ' + id ) );


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * retrieve a set of distinct ids from the given file
 */
function getDistinct( file, prop ) {
  
  // load file
  const content = Fs.readFileSync( file, 'utf8' );
  
  // parse file
  const data = JSON.parse( content );
  
  // gather distinct ids
  const result = new Set();
  for( let i=0; i<data.length; i++ ) {
    result.add( data[i][prop] );
  }
  
  return result;
}


/**
 * find added ids from source to target
 */
function getDiff( source, target ) {
  
  const result = new Set();
  target.forEach( (id) => {
    if( !source.has( id) ) {
      result.add( id );
    }
  });

  return result;
}