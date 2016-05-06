"use strict";
/**
 * calculate the coverage of an ontology wrt to the different connection relations
 * == number of distinct URIs of a given type in a relation
 *
 * example: "how many units are attached to a system of units?"
 *          or
 *          "how many quantity kinds have at least one unit?"
 *
 * output:
 * - "statistic - relation coverage" ... counts how many instances of the baseType have at least one entry in the relation
 * - "statistic - relation coverage missing"   ... URIs of the baseType with no entry in the relation
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    Structure= require( './config/structure' );

// local settings
var localCfg = {
      moduleName: 'statistic - relation coverage',
      moduleKey:  '3700'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    skip = { // baseType/relations combinations to skip
        prefixUnit: [ 'unit' ]
    };


function statisticRelationCoverage() {

  // log
  log( 'calculating coverage' );

  // prepare results
  var results = {},
      missing = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // get relations and base types
  var baseTypes = getBaseTypes(),
      relations = getRelations( baseTypes ),
      connections = getConnections( relations );

  // count for each ontology
  for( var onto of ontos ) {

    // log
    log( '   processing ' + onto );

    // make sure entries in result exist
    results[ onto ] = {};
    missing[ onto ] = {};

    // for each connection
    for( var conn of connections ) {

      // get data for connection
      var relData = OntoStore.getData( onto, conn.relation );

      // skip for empty connections
      if( relData.length < 1 ) {
        continue;
      }

      // log
      log( '      ' + conn.relation );

      // for each base type
      for( var type of conn.nodes ) {

        // skip some
        if( (conn.relation in skip) && (skip[ conn.relation ].indexOf( type ) > -1 ) ) {
          continue;
        }

        // get URIs and filter for empty values
        var uris = relData.map( (entry) => entry[ type ] )
                          .filter( (uri) => uri );

        // get a list of unique URIs of baseType in connection
        var uniqueUris = new Set( uris );

        // add to result
        results[ onto ][ type ] = results[ onto ][ type ] || {};
        results[ onto ][ type ][ conn.relation ] = uniqueUris.size;

        // get a unique list of baseType entries
        var baseData = OntoStore.getData( onto, type ),
            uniqueBase = new Set( baseData.map( (entry) => entry[ type ] ) );

        // find those, that miss an relation entry
        var miss = [ ... uniqueBase ].filter( (uri) => !uniqueUris.has( uri ) );

        // add to missing result
        if( miss.length > 0 ){
          missing[ onto ][ type ] = missing[ onto ][ type ] || {};
          missing[ onto ][ type ][ conn.relation ] = miss;
        }

      }

    }

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + ' missing', missing );

  return Q( true );

}


/**
 * return a list of base types
 * @returns {Array[String]}
 */
function getBaseTypes(){
  return Object.keys( Structure )
               .filter( (key) => {
                 return key in Structure[ key ];
               });
}

/**
 * get the relations relevant for the given baseTypes
 *
 * @param   {Array[String]}   baseTypes
 * @returns {Object}
 */
function getRelations( baseTypes ) {

  // collect results
  var results = {};

  // add all connections
  Object.keys( Structure )
        .forEach( (key) => {

          // we are not concerned with the base types
          if( baseTypes.indexOf( key ) > -1 ) {
            return;
          }

          // add entry for all present base types
          for( var type of baseTypes ) {
            if( (type in Structure[ key ]) ) {
              results[ type ] = results[ type ] || [];
              results[ type ].push( key );
            }
          }

        });

  // return result
  return results;

}

/**
 * get the provided connections by the relations
 * @param     relations
 * @returns
 */
function getConnections( relations ) {

  // hold results
  var map = {};

  // build connections
  Object.keys( relations )
        .forEach( (base) => {
          relations[ base ].forEach( (conn) => {
            map[ conn ] = map[ conn ] || [];
            map[ conn ].push( base );
          });
        });

  // format return value
  return Object.keys( map )
               .map( (conn) => {
                 return {
                   relation: conn,
                   nodes: map[ conn ]
                 };
               });
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticRelationCoverage().done();
} else {
  module.exports = statisticRelationCoverage;
}