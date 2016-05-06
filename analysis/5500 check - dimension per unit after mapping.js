"use strict";
/**
 * cross validate unit mapping and dimension mapping using the dimensionUnit association
 *
 * output:
 * - "check - dimension per unit after mapping" ... list of dimension-unit-pairs, that are ambiguous wrt. to dimensionUnit
 * - "check - dimension per unit after mapping error" ... ambiguous relations in dimensionUnit, if any
 */

// includes
var Q   = require( 'q' ),
    Fs  = require( 'fs' ),
    Log = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
    moduleKey: '5500',
    moduleName: 'check - dimension per unit after mapping'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function checkDimensionPerUnitAfterMapping() {

  // log
  log( 'cross checking the mappings for dimensions and units' );

  // create lookup for dimension SynSets
  log( '   creating dimension lookup' );
  var dimSynsets = OntoStore.getResult( 'mapDimension' ),
      dimLookup = {};
  for(var synset of dimSynsets ) {

    // get all synonyms
    var syns = synset.getSynonyms();

    // add all to lookup
    for( var syn of syns ) {
      dimLookup[ syn.getURI() ] = synset;
    }

  }

  // get all unit-dimension-mappings and build a lookup
  log( '   loading unit-dimension mapping' );
  var unitDimLookup = {},
      ontos = OntoStore.getOntologies(),
      dups = [];
  for( var onto of ontos ) {

    // get the unit-dimension mapping
    var unitDimMap = OntoStore.getData( onto, 'dimensionUnit' );

    for( var entry of unitDimMap ) {

      // check for duplicates on the way
      if( unitDimLookup[ entry.unit ] ) {
        dups.push({
          unit: entry.unit,
          onto: onto,
          dims: [ unitDimLookup[ entry.unit ], entry.dimension ]
        });
      }

      // add to lookup
      unitDimLookup[ entry.unit ] = entry.dimension;
    }

  }

  // if the unit-dimension mapping is ambiguous, stop here
  if( dups.length > 0 ) {

    // store in file
    OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' error', dups );

    // log error
    log( '   Duplicates in unit-dimension mapping; see log file for details', Log.ERROR );

    // end execution
    return Q( false );

  }

  // processing unit SynSets
  log( '   checking unit synsets for errors' );
  var unitSynsets = OntoStore.getResult( 'mapUnit' ),
      mismatches = [];
  for( var unitSynset of unitSynsets ) {

    // get all synonyms
    var syns = unitSynset.getSynonyms();

    // collect all referenced dimension SynSets
    var dimSynsets = syns.map( (syn) =>{

                       // get respective dimension URI
                       var dimUri = unitDimLookup[ syn.getURI() ];

                       // return associated dimension SynSet
                       return dimLookup[ dimUri ];

                     })
                     .filter( (entry) => { return !!entry } );

    // get unique values
    var uniqueDimSynsets = new Set( dimSynsets );

    // check it
    if( uniqueDimSynsets.size > 1 ) {

      mismatches.push({
        unit: unitSynset,
        dims: [ ... uniqueDimSynsets ]
      });

    }

  }

  // results
  if( mismatches.length > 0 ) {
    log( '   found mismatches: ' + mismatches.length );
  }
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mismatches );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkDimensionPerUnitAfterMapping().done();
} else {
 module.exports = checkDimensionPerUnitAfterMapping;
}
