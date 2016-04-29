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
      moduleName: 'createOverlapCountsTable',
      moduleKey:  'a002'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    header = [
      'present in ontologies',
      '\\#units',
      '\\#non-prefix units',
      'total'
    ];


function unitDistribution() {

  // get ontology counts
  var counts_total    = OntoStore.getResult( 'unitOverlap_sharedCounts_total' ),
      counts_noPrefix = OntoStore.getResult( 'unitOverlap_sharedCounts_noPrefix' );

  // column header
  var colHeader = Object.keys( counts_total );
  colHeader.sort();
  
  // create output
  var out = [],
      row = [ header[0] ];
  for( var i=0; i<colHeader.length; i++ ) {
    row.push( colHeader[i] );
  }
  row.push( header[3] );
  out.push( row.join( ' & ' ) );
  out.push( "\\\\\n" );
  out.push( "\\hline\n" );
  
  // add counts (total)
  row = [ header[1] ];
  var sum = 0;
  for( var i=0; i<colHeader.length; i++ ) {
    row.push( counts_total[ colHeader[i] ] );
    sum += +counts_total[ colHeader[i] ];
  }
  row.push( sum );
  out.push( row.join( ' & ' ) );
  out.push( "\\\\\n" );
  
  // add counts (noPrefix)
  row = [ header[2] ];
  sum = 0;
  for( var i=0; i<colHeader.length; i++ ) {
    row.push( counts_noPrefix[ colHeader[i] ] );
    sum += +counts_noPrefix[ colHeader[i] ];
  }
  row.push( sum );
  out.push( row.join( ' & ' ) );
  out.push( "\\\\\n" );
      
  // write to file
  var filename = __dirname + '/../res/tableOverlapCounts.tex';
  Fs.writeFileSync( filename, out.join( '' ) );
  log( 'written ' + filename );
  
  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  unitDistribution().done(); 
} else { 
  module.exports = unitDistribution; 
}