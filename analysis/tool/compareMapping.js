"use strict";
/**
 * compare two given results of a mapping
 */

var localCfg = {
  source: 'mapUnit',
  target: 'mapUnit.bkp'
};

// includes
var OntoStore = require( __dirname + '/../util/OntoStore' );

// load source
var data = OntoStore.getResult( localCfg.source ),
    source = processInput( data );

// load target
var data = OntoStore.getResult( localCfg.target ),
    target = processInput( data );


// walk all uri and look for differences
Object.keys( source )
      .forEach( (uri) => {
        
        // get source and target list
        var slist = source[ uri ],
            tlist = target[ uri ];
        
        // compare both arrays
        if( !isEqualArr( slist, tlist ) ) {
          console.log({
            uri: uri,
            source: slist,
            target: tlist
          });
          console.log( '---------------------------------');
        }
        
      });





/**
 * convert the lookup to a hashmap uri => synset uris
 * @param data
 */
function processInput( data ) {
  
  // prep result
  var lookup = {};
  
  // walk over all synsets
  for( var synset of data ) {
    
    // get synonyms
    var syns = synset.getSynonyms();
    
    // walk over all synonyms
    for( var syn of syns ) {
      
      lookup[ syn.getURI() ] = syns.map( (s) => s.getURI() );
      
    }
    
  }
  
  return lookup;
  
}


/**
 * compare elements of two arrays
 * @param a
 * @param b
 * @returns
 */
function isEqualArr( a, b ) {
  
  if( a.length != b.length ) {
    return false;
  }
  
  for( var i=0; i<a.length; i++ ) {
    if( b.indexOf( a[i] ) < 0 ) {
      return false;
    }
  }
  
  return true;
  
}