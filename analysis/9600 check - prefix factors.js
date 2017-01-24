"use strict";
/**
 * Create HTML output for mismatches in prefix factors
 *
 * output:
 * - "check - prefix factors" ... list of prefix SynSets with mismatches in factor
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'check - prefix factors',
      moduleKey:  '9600'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkPrefixFactors() {

  // get conversion mismatches
  var mismatches = OntoStore.getResult( 'check - prefix factors' ).slice( 0 );

  // order by display label of first prefix
  mismatches.sort( (a,b) => {

    // get the labels from the first entry
    var labelA = a.getDisplayLabel(),
        labelB = b.getDisplayLabel();

    // compare
    return labelA.localeCompare( labelB );

  });

  // prep table header
  var out = [ '<table class="firstColHeader"><tr>',
                '<th>Prefix</th>',
                '<th>Ontology</th>',
                '<th>Factor</th>',
                '<th>raw Factor</th>',
                '<th><span title="&lt; Number.MAX_SAFE_INTEGER">save?</span></th>',
               '</tr>' ];

  // add entries
  for( var entry of mismatches ) {

    // get involved prefixes
    var syns = entry.getSynonyms();

    // add prefix cell
    out.push( '<tr><th rowspan="' + syns.length + '">', entry.getDisplayLabel(), '</th>' );

    // add first row
    out.push( '<td><ul><li data-onto="' + syns[0].getOntology() + '">', syns[0].getOntology(), '</ul></td>',
              '<td>', syns[0].getFactor(), '</td>',
              '<td>', syns[0].getRaw().factor, '</td>',
              '<td>', (syns[0].getFactor() < Number.MAX_SAFE_INTEGER) ? '&#10003;' : '&#10007;', '</td>',
              '</tr>' );

    // add other conversions
    for( var i=1; i<syns.length; i++ ) {

      out.push( '<tr>',
                '<td><ul><li data-onto="' + syns[i].getOntology() + '">', syns[i].getOntology(), '</ul></td>',
                '<td>', syns[i].getFactor(), '</td>',
                '<td>', syns[i].getRaw().factor, '</td>',
                '<td>', (syns[i].getFactor() < Number.MAX_SAFE_INTEGER) ? '&#10003;' : '&#10007;', '</td>',
                '</tr>' );
    }
  }
  out.push( '</table>' );


  // write results to file
  log( 'written output' );
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('\n')
  });

  // done
  return Q( true );

}

/**
 * convert the list of involved prefixes to HTML output
 * @param   {Array}   involved
 * @returns {String}
 */
function printInvolved( unitLookup, involved ) {

  // no other involved units
  if( !involved ) {
    return '';
  }

  var out = [ '<div><span class="tooltip">&#10133;<div><ul>' ];
  for( var i=0; i<involved.length; i++ ) {

    // get prefix labels
    var label1 = unitLookup[ involved[i].unit1 ].getDisplayLabel(),
        label2 = unitLookup[ involved[i].unit2 ].getDisplayLabel();

    // add to output
    out.push( '<li>', label1, ' &rarr; ', label2, ': *', involved[i].convFactor, ' + ', involved[i].convOffset, '<br>' );
  }
  out.push( '</ul></div></span></div>' );

  return out.join('\n');
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkPrefixFactors().done();
} else {
  module.exports = checkPrefixFactors;
}