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
      moduleName: 'createSynsetCountsTable',
      moduleKey:  'a002'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    names = {
        appArea:      'field of application',
        quantKind:    'kind of quantity',
        system:       'system of units',
        unit:         'measurement unit',
        unit_prefix_total: 'prefixed unit',
        unit_noprefix_total: 'non-prefixed unit'
    },
    excludes = [ 'conversion' ];


function unitDistribution() {

  // get ontology counts
  var counts = OntoStore.getResult( 'countSynsets' );

  
  // create output
  var out = [],
      row = [ 'concept', 'extracted', 'mapped' ];
  out.push( row.join( ' & ' ) );
  out.push( "\\\\\n" );
  out.push( "\\hline\n" );
  
  // add values
  Object.keys( counts )
        .forEach( (key) => {
          
          // exclude some concepts
          if( excludes.indexOf( key ) > -1 ) {
            return;
          }
          
          // add to table
          var row = [ names[ key ] || key, counts[ key ].plain, counts[ key ].mapped ];
          out.push( row.join( ' & ' ) );
          out.push( "\\\\\n" );
          
        });
      
  // write to file
  var filename = __dirname + '/../res/tableSynsetCounts.tex';
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