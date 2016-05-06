"use strict";
/**
 * map the application fields of the ontologies to SynSets
 *
 * output
 * - "mapAppField" ... list of SynSets
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    mapObjects  = require( './util/mapObjects' );

// local settings
var localCfg = {
    moduleName: 'mapAppField',
    moduleKey: '4300'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function mapAppField() {

  // log
  log( 'matching application fields' );

  // get application field list
  var appFields = OntoStore.getResult( 'appField' );

  // do the mapping
  var mapped = mapObjects({
    values: appFields,
    manual: '4300 mapAppField.csv'
  }, log );

  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mapped );

  // log output
  log( 'finished mapping application fields' );
  log( '   application fields: '    + appFields.length );
  log( '   synonym sets: '  + mapped.length );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  mapAppField().done();
} else {
 module.exports = mapAppField;
}
