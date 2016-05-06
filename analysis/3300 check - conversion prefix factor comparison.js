"use strict";
/**
 * check, if there are contradictions in an ontology between conversion and prefix values
 *
 * output:
 * - "check - conversion prefix factor comparison" ... list per ontology of contradictions
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    math = require( 'mathjs' );

// local settings
var localCfg = {
      moduleName: 'check - conversion prefix factor comparison',
      moduleKey:  '3300'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function checkConversionPrefixFactorComparison() {

  log( 'checking conversion factors of prefixed units' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {

    // per ontology results
    var missingConversions = new Set(),
        inconsistentConversion = new Set();

    // load data
    var conversionData  = OntoStore.getData( onto, 'conversion' ),
        prefixData      = OntoStore.getData( onto, 'prefix' ),
        prefixUnitData  = OntoStore.getData( onto, 'prefixUnit' );

    // create prefixFactor lookup
    var prefixFactorMap = new Map();
    for( var prefix of prefixData ) {
      if (prefix.factor){
        prefixFactorMap.set(prefix.prefix, prefix.factor);
      }
    }

    // create conversionFactor lookup
    var conversionMap = new Map();
    for( var conversion of conversionData ) {
      if (conversion.convFactor){
        var // convert factor and offset to bignumber and set defaults
            factor = math.bignumber( conversion.convFactor ? conversion.convFactor : 1 ),
            offset = math.bignumber( conversion.convOffset ? conversion.convOffset : 0 ),
            // generate lookup keys
            key       = "" + conversion.unit1 + "|" + conversion.unit2,
            keyReverse = "" + conversion.unit2 + "|" + conversion.unit1;
        // add conversion to map for both directions
        conversionMap.set(key,        {factor: factor, offset: offset , reverse:false});
        conversionMap.set(keyReverse, {factor: factor, offset: offset , reverse:true});
      }
    }

    // check for missing or wrong conversions
    for( var prefixUnit of prefixUnitData ) {

      // only if prefix and base is defined
      if (prefixUnit.baseUnit && prefixUnit.prefix) {

        // generate lookup key
        var conversionKey = "" + prefixUnit.unit + "|" + prefixUnit.baseUnit;

        if (conversionMap.has(conversionKey)) {

          // if conversion exists add test of correct values

          // get conversion
          var conversion = conversionMap.get(conversionKey);

          // get factor of prefix and convert to bignumber
          var prefixFactor = math.bignumber(prefixFactorMap.get(prefixUnit.prefix));

          // get conversion factor
          var conversionFactor = conversion.factor;

          // account for conversion direction
          if( conversion.reverse ) {
            var conversionFactor = math.chain( 1 ).divide( conversionFactor ).done();
          }

          // check if factor and offset are correct
          if (!math.equal(conversion.offset,0) || !math.equal(conversionFactor, prefixFactor)) {

            // if factor or offset are not correct add to set of inconsistent conversion
            inconsistentConversion.add([prefixUnit.unit,prefixUnit.baseUnit]);

          }

        } else {

          // if conversion not exists add to set off missed conversions
          missingConversions.add([prefixUnit.unit,prefixUnit.baseUnit]);

        }
      }
    }

    // logging
    log( '   ' + onto + ' - total: ' + prefixUnitData.length );
    log( '      missingConversions: '    + missingConversions.size,   missingConversions.size   > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      inconsistentConversion: ' + inconsistentConversion.size, inconsistentConversion.size > 0 ? Log.WARNING : Log.MESSAGE );

    // add to result
    resultsPerOntology[ onto ] = {
        missingConversions:   missingConversions,
        inconsistentConversion: inconsistentConversion
    };
  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkConversionPrefixFactorComparison().done();
} else {
  module.exports = checkConversionPrefixFactorComparison;
}