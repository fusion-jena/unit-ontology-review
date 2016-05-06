"use strict";
/**
 * Create HTML output for mismatches in dimension vectors
 *
 * output:
 * - "check - dimensionVector" ... list of dimensions with mismatches in their dimension vector
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' ),
    buildLookup = require( './util/buildLookup' );

// local settings
var localCfg = {
      moduleName: 'check - dimensionVector',
      moduleKey:  '9400'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkDimensionVector() {

  // get results
  var results = OntoStore.getResult( 'check - dimensionVector' );

  // build dimension lookup for naming
  var dimensions = OntoStore.getResult( 'dimension' ),
      dimLookup = buildLookup( dimensions );


  // prep table header
  var out = [ '<table class="firstColHeader"><tr>',
                '<th>dimension</th>',
                '<th>Ontology</th>',
                '<th>URI</th>',
                '<th>dimLength</th>',
                '<th>dimMass</th>',
                '<th>dimTime</th>',
                '<th>dimElec</th>',
                '<th>dimThermo</th>',
                '<th>dimAmount</th>',
                '<th>dimLum</th>',
               '</tr>' ];

  // add entries
  for( var entry of results ) {

    // get the label from the first entry
    var label = dimLookup[ entry[0].uri ].getDisplayLabel();

    // add dimension cell
    out.push( '<tr><th rowspan="', entry.length, '">', label, '</th>' );

    // add first conversions
    var dim = entry[0];
    out.push( '<td><ul><li data-onto="', dim.onto, '">', dim.onto, '</ul></td>',
               '<td><a href="', dim.uri, '">', dim.uri, '</a></td>' );
    for( var j=0; j<dim.vector.length; j++ ) {
      out.push( '<td>', dim.vector[j], '</td>' );
    }
    out.push( '</tr>' );

    // add other conversions
    for( var i=1; i<entry.length; i++ ) {

      // shortcut
      dim = entry[i];

      // output
      out.push( '<tr><td><ul><li data-onto="', dim.onto, '">', dim.onto, '</ul></td>',
                '<td><a href="', dim.uri, '">', dim.uri, '</a></td>' );
      for( var j=0; j<dim.vector.length; j++ ) {
        out.push( '<td>', dim.vector[j], '</td>' );
      }
      out.push( '</tr>' );
    }
  }
  out.push( '</table>' );

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('')
  });
  log( 'written output' );

  // done
  return Q( true );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkDimensionVector().done();
} else {
  module.exports = checkDimensionVector;
}