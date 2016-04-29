"use strict";
/**
 * Create HTML output for the results of property distribution in SPARQL files
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    Structure   = require( './config/structure.js' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'sparqlResults',
      moduleKey:  '9050'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function sparqlResults() {

  // get conversion mismatches
  var counts = OntoStore.getResult( 'checkSparqlResults' );
  
  // prepare table header
  var out = [ '<table class="firstColHeader"><tr><th></th><th></th>' ];
  var ontos = Object.keys( counts );
  ontos.forEach( (onto) => {
          out.push( '<th><ul><li data-onto="', onto, '">', onto, '</ul></th>' );
        });
  out.push( '</tr>' );
  
  // one row per result types' properties
  for( var type in Structure ) {
    
    // get list of properties for this type
    var props = Object.keys( Structure[ type ] );
    
    // insert first col
    out.push( '<tr><th rowspan="', props.length + 1, '">', type, '</th>' );
    
    // add total count
    out.push( '<td>total</td>' );
    ontos.forEach( (onto) => {
      if( type in counts[ onto ] ) {
        out.push( '<td>', counts[ onto ][ type ]._total, '</td>' );
      } else {
        out.push( '<td>0</td>' );
      }
    });
    out.push( '</tr>' );
    
    // other properties
    for( var i=0; i<props.length; i++ ) {
      out.push( '<tr><td>', props[i], '</td>' );
      ontos.forEach( (onto) => {
        if( type in counts[ onto ] ) {
          var val = counts[ onto ][ type ][ props[i] ] || 0,
              symbol = getSymbol( val, counts[ onto ][ type ]._total );
          out.push( '<td>', symbol, ' ', val, '</td>' );
        } else {
          out.push( '<td>-</td>' );
        }
      });
      out.push( '</tr>' );
    }
    
  }
  out.push( '</table>' );
  
  // write results to file
  log( 'written output' );
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('')
  });
  
  // done
  return Q( true );    

}


function getSymbol( count, total ) {
  
  // set default value
  count = count || 0;
  
  // calculate fraction
  var frac = count / total;
  
  // determine color
  var color;
  switch( true ) {
  
    case frac >= 1:     color = 'green'; break;
    case frac  > 0.5:   color = 'yellow'; break;
    case frac  > 0:     color = 'orange'; break;
    default:            color = 'red'; break;
  }
  
  if( frac >= 1 ) {
    return '<span style="padding: 0.1em;border: 1px solid black;background-color: #A4A4A4;color:' + color + '">&#10003;</span>';
  } else {
    return '<span style="padding: 0.1em;border: 1px solid black;background-color: #A4A4A4;color:' + color + '">&#10007;</span>';
  }
  
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  sparqlResults().done(); 
} else { 
  module.exports = sparqlResults; 
}