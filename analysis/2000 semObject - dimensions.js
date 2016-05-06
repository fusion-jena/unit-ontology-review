"use strict";
/**
 * convert the extracted list of dimension to SemDimension objects
 *
 * output:
 * - "dimension" ... list of all converted dimensions
 * - "dimension_perOnto" ... list of converted dimensions per ontology
 */

// includes
var Q                   = require( 'q' ),
    Log                 = require( './util/log.js' ),
    OntoStore           = require( './util/OntoStore' ),
    convertToSemObject  = require( './util/convertToSemObject' );

//local settings
var localCfg = {
    moduleName: 'dimension',
      moduleKey: '2000'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };

/**
 * convert the extracted list of dimension to SemDimension objects
 */
function semObjectDimensions() {

  // log
  log( 'parsing dimensions' );

  // list of used stopwords
  var stopwords = [ 'dimension', 'unit' ]
                    .map( (word) => (new RegExp( '\\b' + word + '\\b', 'gi' )) );

  // results
  var resultsAll     = [],
      resultsPerOnto = {};

  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // process all ontologies
  for( var onto of ontos ) {

    // load raw ontology dimensions
    var data = OntoStore.getData( onto, "dimension" );

    // convert to SemDimension instances
    var instances = convertToSemObject({
      values:     data,
      onto:       onto,
      type:       OntoStore.DIMENSION,
      uriProp:    'dimension',
      labelProp:  'label',
      stopwords:  stopwords,
      entryCreated: function( raw, entry ) {

        // try to attach dim vector
        var dimVec = getDimvector( raw );
        if( dimVec ) {
          entry.setVector( dimVec );
        }

      }
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
  log( 'extracted dimensions: ' + resultsAll.length );

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
  semObjectDimensions().done();
} else {
 module.exports = semObjectDimensions;
}
