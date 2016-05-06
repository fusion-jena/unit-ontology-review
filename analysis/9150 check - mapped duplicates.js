"use strict";
/**
 * Create HTML output for duplicate mappings,
 * that is SynSets containing more than one individual from a single ontology
 *
 * output:
 * - "check - mapped duplicates" ... list of possible duplicates
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'check - mapped duplicates',
      moduleKey:  '9150'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    mappings = [ 'mapAppField', 'mapDimension', 'mapPrefix', 'mapQuantKind', 'mapSystem', 'mapUnit' ]


function checkMappedDuplicates() {

  // prepare output
  var out = [];

  for( var type of mappings ) {

    // get list of duplicates
    var data = OntoStore.getResult( 'check - mapped duplicates_' + type );

    // if empty, skip
    if( data.length < 1 ){
      continue;
    }

    // add header for type
    out.push( '<h2>' + type + '</h2>' );

    // add all duplicates
    for( var dup of data ) {

      out.push( '<b>', dup.label, '</b>' );
      out.push( '<ul>' );
      for( var obj of dup.objs ) {
        out.push( '<li data-onto="', dup.onto, '"><a href="', obj, '">', obj, '</a>' );
      }
      out.push( '</ul>' );

    }

  }

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('')
  });

  // log
  log( 'written output' );

  // done
  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkMappedDuplicates().done();
} else {
  module.exports = checkMappedDuplicates;
}