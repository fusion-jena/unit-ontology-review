"use strict";
/**
 * count prefixed units per ontology
 * - by prefixUnit    ... any ontology has recognized this unit as prefixed
 * - by heuristic     ... no ontology has recognized this unit as prefixed
 * 
 * produced values:
 * 
 * unit_noprefix_sparql           ... #units without a prefix (no ontology labels this unit as prefixed)
 * unit_prefix_heuristic          ... #(prefixed units) not recognized by ontologies, but by heuristic
 * unit_prefix_heuristic_perOnto  ... #(prefixed units) not recognized by particular ontology, but by heuristic;
 *                                    doesn't take unit_noprefix_sparql into account!
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    buildLookup = require( './util/buildLookup' );

// local settings
var localCfg = {
      moduleName: 'countPrefix',
      moduleKey: '6010'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    collectedValues = [ 
      'unit_noprefix_total',
      'unit_noprefix_ontology',
      'unit_prefix_ontology',
      'unit_prefix_heuristic',
      'unit_prefix_unrecognized',
      'unit_prefix_total'
    ];


function countPrefix() {
  
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // cache results
  var results = {};

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
  
  // build lookup over unitSynsets
  var unitSynsetLookup = buildLookup( unitSynSets );
  
  // iterate over all unit-SynSet
  for( var synset of unitSynSets ){
    
    // non-prefixed unit-SynSet
    if( !synset.isPrefixed() ) {
      
      for( var unit of synset.getSynonyms() ){
        counts[ unit.getOntology() ][ 'unit_noprefix_total' ] += 1;
      }
      
      continue;
      
    }
    
    // prefixed unit-SynSet
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
  countPrefix().done(); 
} else { 
  module.exports = countPrefix; 
}