"use strict";
/**
 * Count the overlap between ontologies in the mapped units
 *
 * output:
 * - "statistic - unit overlap - shared noPrefix" ... shared units without prefix among x ontologies
 * - "statistic - unit overlap - shared total" ... shared units among x ontologies
 * - "statistic - unit overlap - sharedCounts noPrefix" ... number of shared units without prefix among x ontologies
 * - "statistic - unit overlap - sharedCounts total" ... number of shared units among x ontologies
 * - "statistic - unit overlap - overlap noPrefix" ... number of shared units without prefix between any two ontologies
 * - "statistic - unit overlap - overlap total" ... number of shared units between any two ontologies
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'statistic - unit overlap',
      moduleKey: '6100'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function statisticUnitOverlap() {

  // log
  log( 'counting unit overlap' );

  // cache results
  var shared_total = {},
      shared_noPrefix = {},
      overlap_total = {},
      overlap_noPrefix = {};

  // get unit mapping
  var mapping = OntoStore.getResult( 'mapUnit' );

  for( var synset of mapping ) {

    // get synonyms
    var syns = synset.getSynonyms();

    // get involved ontologies
    var ontos = new Set( syns.map( (syn) => syn.getOntology() ) );

    // count shared units
    shared_total[ ontos.size ] = shared_total[ ontos.size ] || [];
    shared_total[ ontos.size ].push( syns );

    // count unit overlap
    for( var onto1 of ontos ){

      overlap_total[ onto1 ] = overlap_total[ onto1 ] || {};

      for( var onto2 of ontos ) {
        overlap_total[ onto1 ][ onto2 ] = overlap_total[ onto1 ][ onto2 ] || 0;
        overlap_total[ onto1 ][ onto2 ] += 1;
      }

    }

    // separate counts for just unprefixed units
    if( !synset.isPrefixed() ) {

      // count shared unit
      shared_noPrefix[ ontos.size ] = shared_noPrefix[ ontos.size ] || [];
      shared_noPrefix[ ontos.size ].push( syns );

      // count unit overlap
      for( var onto1 of ontos ){

        overlap_noPrefix[ onto1 ] = overlap_noPrefix[ onto1 ] || {};

        for( var onto2 of ontos ) {
          overlap_noPrefix[ onto1 ][ onto2 ] = overlap_noPrefix[ onto1 ][ onto2 ] || 0;
          overlap_noPrefix[ onto1 ][ onto2 ] += 1;
        }

      }
    }

  }

  // transform shared
  var sharedCounts_noPrefix = {},
      sharedCounts_total = {};
  Object.keys( shared_total )
        .forEach( (key) => {

          // result one: mere counts
          sharedCounts_total[ key ]     = shared_total[ key ].length;
          sharedCounts_noPrefix[ key ]  = shared_noPrefix[ key ].length;

          // result two: actual units
          shared_total[ key ] = shared_total[ key ].map( (syns) => {
            return syns.map( (syn) => syn.getURI() );
          });
          shared_noPrefix[ key ] = shared_noPrefix[ key ].map( (syns) => {
            return syns.map( (syn) => syn.getURI() );
          });


        });

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' - shared noPrefix', shared_noPrefix );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' - shared total', shared_total );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' - sharedCounts noPrefix', sharedCounts_noPrefix );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' - sharedCounts total', sharedCounts_total );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' - overlap noPrefix', overlap_noPrefix );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' - overlap total', overlap_total );

  // done
  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticUnitOverlap().done();
} else {
  module.exports = statisticUnitOverlap;
}