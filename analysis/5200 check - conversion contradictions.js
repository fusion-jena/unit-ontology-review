"use strict";
/**
 * check the mapped conversions for consistency across ontologies
 * eliminates conversions, which seem to be rounded values of one another
 *
 * output:
 * - "check - conversion contradictions" ... list of contradicting conversions
 * - "check - conversion contradictions rounded" ... list of contradicting conversions taking rounding into account
 */

// includes
var Q     = require( 'q' ),
    math  = require( 'mathjs' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    buildLookup = require( './util/buildLookup' ),
    roundEqual  = require( './util/roundEqual' );

//local settings
var localCfg = {
    moduleName: 'check - conversion contradictions',
    moduleKey: '5200'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function checkConversionContradictions() {

  // log
  log( 'check conversions' );

  // get unit SynSets and build a lookup
  log( '   building unit lookup' );
  var units = OntoStore.getResult( 'mapUnit' ),
      unitLookup = buildLookup( units );

  // get mapped conversions
  var conversions = OntoStore.getResult( 'mapConversion' );

  // remember non-consistent conversions
  var deviations = [],
      rounded = [];

  // process all conversions
  log( '   checking conversion sets' );
  for( var conv of conversions ) {

    // count number of reversed entries
    var reversed = conv.reduce( ( sum, entry) => {
      return entry.reverse ? sum + 1 : sum;
    }, 0 );

    // determine, whether the reversed or non-reversed has a majority
    var useReversed = 2 * reversed > conv.length;

    // collect all conversion factors and offsets
    var factorSet = new Set(),
        offsetSet = new Set();
    conv.forEach( (entry) => {

      // convert both values to numbers
      var factor = math.bignumber( entry.convFactor ? entry.convFactor : 1 ),
          offset = math.bignumber( entry.convOffset ? entry.convOffset : 0 );

      // account for conversion direction
      if( useReversed !== entry.reverse ) {
        /*
         * a U1 * factor + offset = b U2
         * a U1 * factor          = b U2 - offset
         * A U1                   = ( b U2 - offset ) / factor
         *                        = b U2 * 1/factor - offset/factor
         */
        offset = math.chain( -1 ).multiply( offset ).divide( factor ).done();
        factor = math.chain( 1 ).divide( factor ).done();
      }

      // add to sets
      offsetSet.add( math.format( offset, { notation: 'fixed', precision: 10 } ) );
      factorSet.add( math.format( factor, { notation: 'fixed', precision: 10 } ) );

    });

    // check
    var inconsistent = false;
    for (var factor1 of factorSet) {
      for (var factor2 of factorSet) {
        inconsistent = inconsistent || !roundEqual( factor1, factor2, 2, 10 );
      }
    }
    for (var offset1 of offsetSet) {
      for (var offset2 of offsetSet) {
        inconsistent = inconsistent || !roundEqual( offset1, offset2, 2, 10 );
      }
    }
    if (inconsistent) {
      deviations.push( conv );
    } else {
      if( (factorSet.size > 1) || (offsetSet.size > 1 ) ) {
        rounded.push( conv );
      }
    }

  }

  // log
  if( deviations.length > 0 ) {
    log( '   rounding deviations: ' + rounded.length );
    log( '   found deviations: ' + deviations.length, Log.WARNING );
    log( '   check log file for details', Log.WARNING );
  }

  // save results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, deviations );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' rounded', rounded );

  // done
  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  checkConversionContradictions().done();
} else {
 module.exports = checkConversionContradictions;
}