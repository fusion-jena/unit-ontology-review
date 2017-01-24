"use strict";
/**
 * Create HTML output for important units missing in an ontology
 *
 * output:
 * - "check - missed units" ... list per ontology of possibly missing units
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' ),
    buildLookup = require( './util/buildLookup' );

// local settings
var localCfg = {
      moduleName: 'check - missed units',
      moduleKey:  '9130'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkMissedUnits() {

  // get list of unrecognized prefixed units
  var missing = OntoStore.getResult( 'check - missed units' );

  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // build output
  var output = [];
  ontos.forEach( (onto) => {

          // no entry, no output
          if( !(onto in missing ) ) {
            return;
          }

          // sort data
          var data = missing[ onto ].slice( 0 );
          data.sort( function( a, b ){
            return a.localeCompare( b );
          });

          // collect output parts
          var out = [ '<h2><ul><li data-onto="' + onto + '">', onto, ' (', data.length, ')</ul></h2><ul>' ];
          for( var obj of data ) {
            out.push( '<li>', obj );
          }
          out.push( '</ul>' );

          // add to output
          Array.prototype.push.apply( output, out );

        });

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: output.join('\n')
  });

  // log
  log( 'written output' );

  // done
  return Q( true );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkMissedUnits().done();
} else {
  module.exports = checkMissedUnits;
}