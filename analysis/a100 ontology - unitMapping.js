"use strict";
/**
 * Create turtle output for unit mapping
 */

//includes
var Fs          = require( 'fs' ),
    Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    Cfg         = require( './config/config.js' );

// local settings
var localCfg = {
      moduleName: 'ontology - unitMapping',
      moduleKey:  'a100'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    restrictTo = false;
//    restrictTo = [ 'OM', 'OM2' ]; // restrict output to listed ontologies; set to false for all ontologies

function ontologyUnitMapping() {

  // ontology in turtle syntax
  var turtle = '@prefix owl: <http://www.w3.org/2002/07/owl#> .\n';
  turtle += '\n';

  // load unitSynSets
  var unitSynSets = OntoStore.getResult( 'mapUnit' );

  for( var unitSynSet of unitSynSets ) {

    // get list of synonyms
    var units = unitSynSet.getSynonyms();

    if (units.length > 1) {
      // iterate synonym pairs
      for (var i = 0; i < units.length ; i++) {

        // maybe skip this unit
        if( restrictTo && !restrictTo.includes( units[i].getOntology() ) ) {
          continue;
        }

        for (var j = i+1; j < units.length ; j++) {

          // maybe skip this unit
          if( restrictTo && !restrictTo.includes( units[j].getOntology() ) ) {
            continue;
          }

          // add same as triple
          turtle += '<' + units[i].getURI() + '> owl:sameAs <' + units[j].getURI() + '> .\n';

        }
      }
      turtle += '\n';
    }

  }

  // remove triple line breaks
  turtle = turtle.replace( /\n\n\n+/g, "\n\n" );

  // write file
  var file =  Cfg.targetPath + localCfg.moduleKey + ' ' + localCfg.moduleName + '.ttl';
  Fs.writeFileSync( file, turtle );
  log( 'written ' + file );

  // done
  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  ontologyUnitMapping().done();
} else {
  module.exports = ontologyUnitMapping;
}