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
    };

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
        for (var j = i+1; j < units.length ; j++) {
            // add same as triple
            turtle += '<' + units[i].uri + '> owl:sameAs <' + units[j].uri + '> .\n';
        }
      }
      turtle += '\n';
    }

  }
  
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