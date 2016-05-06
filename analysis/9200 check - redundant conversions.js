"use strict";
/**
 * Create HTML output for used redundant conversions in a single ontology
 *
 * output:
 * - "check - redundant conversions" ... list per ontology of redundant conversions
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' ),
    buildLookup = require( './util/buildLookup' );

// local settings
var localCfg = {
      moduleName: 'check - redundant conversions',
      moduleKey:  '9200'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkRedundantConversions() {

  // get results
  var results = OntoStore.getResult( 'check - redundant conversions' );

  // build unit lookup for naming
  var units = OntoStore.getResult( 'unit' ),
      unitLookup = buildLookup( units );

  // create output
  var out = [];
  for( var onto in results ) {

    // skip empty
    if( results[ onto ].length < 1 ) {
      continue;
    }

    out.push( '<h2><ul><li data-onto="', onto, '">', onto, '</ul></h2><ul>' );

    for( var entry of results[ onto ] ) {

      // get involved units by first entry
      var fromUnit = entry[0].unit1,
          toUnit   = entry[0].unit2;

      // entry header
      out.push( '<li data-onto="', onto, '">',
                  unitLookup[ fromUnit ].getDisplayLabel(), ' ( ', fromUnit, ' )',
                  '<br>&harr;<br>',
                  unitLookup[ toUnit ].getDisplayLabel(), '( ', toUnit, ' )',
                '<ul>'
              );

      for( var conv of entry ) {

        // get direction
        var dir = conv.unit1 == fromUnit;

        // insert
        out.push( '<li>',
                  '<span style="font-size: 150%;">',(dir ? '&rarr;' : '&larr;' ), '</span> : ',
                  'factor: ', conv.convFactor, ' | ',
                  'offset: ', conv.convOffset
                );

      }

      out.push( '</ul>' );
    }

    out.push( '</ul>' );

  }

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
  checkRedundantConversions().done();
} else {
  module.exports = checkRedundantConversions;
}