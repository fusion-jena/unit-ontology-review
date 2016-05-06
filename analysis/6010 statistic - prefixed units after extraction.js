"use strict";
/**
 * count prefixed units per ontology
 * synonyms in one ontology will be counted repeatedly
 *
 * calculated values:
 * - unit_noprefix_total      : count of units without prefix (not stated by the ontology, other ontologies or heuristic)
 * - unit_prefix_ontology     : count of units with prefix (stated by the ontology)
 * - unit_prefix_heuristic    : count of units with prefix (not stated by the ontology, but stated by heuristic)
 * - unit_prefix_unrecognized : count of units with prefix (not stated by the ontology or heuristic, but stated by other ontology)
 * - unit_prefix_total        : count of units with prefix (stated by the ontology, other ontologies or heuristic)
 *
 * output:
 * - "statistic - prefixed units after extraction" ... calculated values per ontology
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    buildLookup = require( './util/buildLookup' );

// local settings
var localCfg = {
      moduleName: 'statistic - prefixed units after extraction',
      moduleKey: '6010'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    collectedValues = [
      'unit_noprefix_total',
      'unit_prefix_ontology',
      'unit_prefix_heuristic',
      'unit_prefix_unrecognized',
      'unit_prefix_total'
    ];


function statisticPrefixedUnitsafterExtraction() {

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // load unit SynSets
  var unitSynSets = OntoStore.getResult( 'mapUnit' );

  // hold results
  var counts = {};

  // init results
  ontos.forEach( (onto) => {
    counts[ onto ] = {};
    collectedValues.forEach( (val) => {
      counts[ onto ][ val ] = 0;
    });
  });

  // build lookup over unit-Synsets
  var unitSynsetLookup = buildLookup( unitSynSets );

  // iterate over all unit-SynSet
  for( var synset of unitSynSets ){

    // non-prefixed unit-SynSet
    if( !synset.isPrefixed() ) {

      // synonyms in one ontology will be counted repeatedly
      for( var unit of synset.getSynonyms() ){
        counts[ unit.getOntology() ][ 'unit_noprefix_total' ] += 1;
      }

      continue;

    }

    // prefixed unit-SynSet
    // synonyms in one ontology will be counted repeatedly
    for( var unit of synset.getSynonyms() ) {

      // unit itself was tagged as prefixed
      if( unit.isPrefixed() ) {

        if( unit.isHeuristicPrefix() ) {

          // by heuristic
          counts[ unit.getOntology() ][ 'unit_prefix_heuristic' ] += 1;

        } else {

          // by ontology
          counts[ unit.getOntology() ][ 'unit_prefix_ontology' ] += 1;

        }

      } else {

        // possibly unrecognised prefixed unit
        counts[ unit.getOntology() ][ 'unit_prefix_unrecognized' ] += 1;

      }

      // total count
      counts[ unit.getOntology() ][ 'unit_prefix_total' ] += 1;

    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX persist XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, counts );

  // log
  log( 'counted types of provenance for prefixed units' );

  // done
  return Q( true );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticPrefixedUnitsafterExtraction().done();
} else {
  module.exports = statisticPrefixedUnitsafterExtraction;
}