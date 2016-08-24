"use strict";
/**
 * convert the extracted list of units to SemUnit objects
 *
 * output:
 * - "unit" ... list of all converted units
 * - "unit_perOnto" ... list of converted units per ontology
 */

// includes
var Q                   = require( 'q' ),
    Log                 = require( './util/log.js' ),
    OntoStore           = require( './util/OntoStore' ),
    FileStore           = require( './util/TemplStore' ),
    convertToSemObject  = require( './util/convertToSemObject' ),
    buildLookup         = require( './util/buildLookup' );

//local settings
var localCfg = {
    moduleName: 'unit',
    moduleKey: '2100'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };

/**
 * convert the extracted list of units to SemUnit objects
 */
function semObjectUnits() {

  // log
  log( 'parsing units' );

  // list of used stopwords
  var stopwords = [ 'unit', 'at' ]
                    .map( (word) => (new RegExp( '\\b' + word + '\\b', 'gi' )) );

  // list of replacements
  var replacements = [
         [ /British thermal unit/gi, 'BTU' ]          // replace with acronym
        ,[ /metre\b/gi, 'meter' ]                     // unify British and American writing
        ,[ /litre\b/gi, 'liter' ]                     // unify British and American writing
        ,[ /\bsquare ([^\s]*)\b/, '$1 squared' ]      // unify syntax for squared units
        ,[ /\bcubic ([^\s]*)\b/, '$1 cubed' ]         // unify syntax for cubic units
        ,[ /\b([^\s]*)metres\b/gi, '$1meter' ]        // unify plural writing
        ,[ /\bdeka/, 'deca' ]                         // unify use of prefix
        ,[ /\bpiko/, 'pico' ]                         // unify use of prefix
        ,[ /\bmikro/, 'micro' ]                       // unify use of prefix
        ,[ /\bnautical/, 'nautic' ]                   // unify nautic and nautical
        ,[ /\breciprocal\b/gi, 'per' ]                // unify per and reciprocal
      ];

  // load system modifiers
  var modifiers = OntoStore.loadPredefinedData( '2100 systemModifier.csv' );

  // build replacements
  var suffix = new Set();
  for( var modifier of modifiers ) {

    // replacements for unifying notation
    if( modifier[0] != modifier[1] ) {
      replacements.push( [ new RegExp( '\\b' + modifier[0] + '\\b', 'gi' ), modifier[1] ] );
    }

    // suffix for moving to the end
    suffix.add( modifier[1] );

  }
  replacements.push( [ new RegExp( '(.*)\\b(' + [ ... suffix ].join('|') + ')\\b(.*)', 'gi' ),
                       '$1 $3 $2' ] );

  // results
  var resultsAll     = [],
      resultsPerOnto = {};

  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // process all ontologies
  for( var onto of ontos ) {

    // try to load create label event processor
    var beforeAddLabel = FileStore.getEventProcessor( onto, 'unit', 'beforeAddLabel' );

    // load raw ontology units
    var data = OntoStore.getData( onto, "unit" );

    // create a lookup for prefixed units
    var prefixUnit = OntoStore.getData( onto, "prefixUnit" ),
        prefixLookup = buildLookup( prefixUnit, 'unit' );

    // convert to SemUnit instances
    var instances = convertToSemObject({
      values:     data,
      onto:       onto,
      type:       OntoStore.UNIT,
      uriProp:    'unit',
      labelProp:  'label',
      langProp:   'labelLang',
      stopwords:  stopwords,
      replacements: replacements,
      entryCreated: function( raw, entry ) {

        // set isPrefixed
        entry.isPrefixed( raw.unit in prefixLookup );

      },
      beforeAddLabel: beforeAddLabel
    });

    // add to results
    resultsPerOnto[ onto ] = instances;
    Array.prototype.push.apply( resultsAll, instances );

    // log
    log( '   processed ' + onto + ': ' + instances.length );

  }

  // store results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsAll );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + '_perOnto', resultsPerOnto );

  // log
  log( 'extracted units: ' + resultsAll.length );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * extract the dimension vector from the given entry or null, if none
 */
function getDimvector( dim ) {

  if( ('dimLum' in dim) && ('dimTime' in dim) && ('dimLength' in dim) && ('dimMass' in dim)
      && ('dimElec' in dim) && ('dimThermo' in dim) && ('dimAmount' in dim)) {
    return [
      dim.dimLength,
      dim.dimMass,
      dim.dimTime,
      dim.dimElec,
      dim.dimThermo,
      dim.dimAmount,
      dim.dimLum
    ];
  } else {
    return null;
  }

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  semObjectUnits().done();
} else {
 module.exports = semObjectUnits;
}