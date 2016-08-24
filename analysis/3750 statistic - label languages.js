"use strict";
/**
 * count languages used for labels per type
 * 
 * output:
 * - "statistic - label languages"
 * 
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    Structure= require( './config/structure' );

// local settings
var localCfg = {
      moduleName: 'statistic - label languages',
      moduleKey:  '3750'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    skip = [ '_uri' ];      // skip artificially introduced "languages"


function statisticLabelLanguages() {

  // log
  log( 'counting languages used in labels' );

  // get list of types using labels
  var types = Object.keys( Structure )
                    .filter( (type) => {
                      return 'label' in Structure[ type ];
                    });
  
  // get list of ontologies
  var ontos = OntoStore.getOntologies();
  
  // count for each type
  var results = {};
  for( var type of types ) {

    // load data
    var objects = OntoStore.getResult( type );

    // walk over list of objects
    for( var obj of objects ) {
      
      // get ontology of object
      var onto = obj.getOntology();
      
      // make sure we have a matching entry in results
      results[ onto ]         = results[ onto ] || {};
      results[ onto ][ type ] = results[ onto ][ type ] || { _total: 0, _missing: 0 };
      
      // get languages for labels in object
      var languages = obj.getLabelLanguages();
      
      // increment counts
      results[ onto ][ type ]._total += 1;
      languages.forEach( (lang) => {
        
        // we skip some (artificially introduced) languages here
        if( skip.indexOf( lang ) < 0 ) {
          results[ onto ][ type ][ lang ] = results[ onto ][ type ][ lang ] || 0;
          results[ onto ][ type ][ lang ] += 1;
        }
        
      })
      
      // there is no (natural language) label at all 
      if( (languages.length == 1) && (languages[0] == '_uri') ) {
        results[ onto ][ type ]._missing += 1;
      }
      
    }
    
  }
 
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  return Q( true );

}



/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticLabelLanguages().done();
} else {
  module.exports = statisticLabelLanguages;
}