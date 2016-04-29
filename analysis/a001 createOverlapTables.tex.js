"use strict";
/**
 * Create HTML output for overlap in mapped units
 */

// includes
var Q           = require( 'q' ),
    Fs          = require( 'fs' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'createOverlapTables',
      moduleKey:  'a001'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function unitOverlap() {

  // get ontologies
  var ontos = OntoStore.getOntologies();

 // run for unit overlap (total)
  var counts = OntoStore.getResult( 'countBySynSet' ),
      overlap = OntoStore.getResult( 'unitOverlap_overlap_total' );
  var out_total = createTable( ontos, counts, 'mapUnit', overlap );

  // run for unit overlap (noPrefix)
  counts = OntoStore.getResult( 'countBySynSet_special' );
  overlap = OntoStore.getResult( 'unitOverlap_overlap_noPrefix' );
  var out_noPrefix = createTable( ontos, counts, 'mapUnit_noPrefix', overlap ) ;
    
  // write to file
  var filename = __dirname + '/../res/tableOverlap_total.tex';
  Fs.writeFileSync( filename, out_total.join( '' ) );
  log( 'written ' + filename );
  var filename = __dirname + '/../res/tableOverlap_noPrefix.tex';
  Fs.writeFileSync( filename, out_noPrefix.join( '' ) );
  log( 'written ' + filename );
  
  // done
  return Q( true );    

}

/**
 * create the Tex table contents for the given overlap data
 * @param ontos
 * @param counts
 * @param overlap
 * @returns
 */
function createTable( ontos, counts, countType, overlap ) {
  
  // prep table header
  var row = [];
  for( var i=0; i<ontos.length; i++ ) {
    row.push( 'X[m,c]' );
  }
  var out = [];
  row = [ '' ];
  for( var i=0; i<ontos.length; i++ ) {
    row.push( '\\strut ' + ontos[i] );
  }
  out.push( row.join( ' & ' ), "\\\\\n \\hline \n" );
  
  // fill table
  for( var onto1 of ontos ) {
    
    row = [ onto1 ];
    
    for( var onto2 of ontos ) {
      
      // get overlap value
      var val;
      if( (onto1 in overlap) && (onto2 in overlap[ onto1 ] ) ){
        val = overlap[ onto1 ][ onto2 ];
      } else {
        val = 0;
      }
      
      // get percentage
      if( counts[ onto1 ][ countType ] > 0 ){
        val = 100 * val / counts[ onto1 ][ countType ];
      }
      
      // add to output
      row.push( val.toFixed( 1 ) + " \\%" );
    }
    
    out.push( row.join( ' & ' ), "\\\\\n" );
    
  }
  
  return out;
}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  unitOverlap().done(); 
} else { 
  module.exports = unitOverlap; 
}