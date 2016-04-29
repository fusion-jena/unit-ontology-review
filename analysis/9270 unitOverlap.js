"use strict";
/**
 * Create HTML output for overlap in mapped units
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'unitOverlap',
      moduleKey:  '9270'
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
  var out_noPrefix = createTable( ontos, counts, 'mapUnit_noPrefix', overlap );
  
  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName + '_total', {
    content: out_total.join('')
  });
  log( 'written output for unit overlap (total)' );
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName + '_noPrefix', {
    content: out_noPrefix.join('')
  });
  log( 'written output for unit overlap (no prefix)' );
  
  // done
  return Q( true );    

}

/**
 * create the HTML table for the given overlap data
 * @param ontos
 * @param counts
 * @param overlap
 * @returns
 */
function createTable( ontos, counts, countType, overlap ) {
  
  // prep table header
  var out = [ '<table><tr><td></td>' ];
  for( var onto of ontos ) {
    out.push( '<th><ul><li data-onto="', onto, '">', onto, '</ul></th>');
  }
  out.push( '<tr>' );
  
  // fill table
  for( var onto1 of ontos ) {
    
    out.push( '<th><ul><li data-onto="', onto1, '">', onto1, '</ul></th>');
    
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
      out.push( '<td>', val.toFixed( 2 ), '</td>' );
    }
    
    out.push( '</tr>' );
  }
  out.push( '</table>' );
  
  out.push( '<div class="comment">100 * #SynSet(row-ontology && col-ontology) / #SynSet(row-ontology)</div>' );
  
  return out;
}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  unitOverlap().done(); 
} else { 
  module.exports = unitOverlap; 
}