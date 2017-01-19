"use strict";
/**
 * count languages used for labels per ontology
 * used to select display label later on
 * 
 * output:
 * - "statistic - label languages overall"
 * 
 */

// includes
const Q        = require( 'q' ),
      Log      = require( './util/log.js' ),
      OntoStore= require( './util/OntoStore' ),
      Structure= require( './config/structure' );

// local settings
let localCfg = {
      moduleName: 'statistic - label languages overall',
      moduleKey:  '1700'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function statisticLabelLanguagesOverall() {

  // log
  log( 'counting overall usage of languages in labels' );

  // get list of types using labels
  let types = Object.keys( Structure )
                    .filter( (type) => {
                      return 'labelLang' in Structure[ type ];
                    });
  
  // get list of ontologies
  let ontos = OntoStore.getOntologies();
  
  // count for each type
  let results = {};
  for( let onto of ontos ) {
    
    for( let type of types ) {

      // load data
      let objects = OntoStore.getData( onto, type );

      // walk over list of objects
      for( let obj of objects ) {
                
        // make sure we have a matching entry in results
        results[ onto ] = results[ onto ] || {};
        
        // get languages for labels in object
        let lang = obj.labelLang;
        
        // default language is empty
        if( !lang ) {
          lang = '';
        }
        
        // increment counts
        results[ onto ][ lang ] = results[ onto ][ lang ] || 0;
        results[ onto ][ lang ] += 1;
        
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
  statisticLabelLanguagesOverall().done();
} else {
  module.exports = statisticLabelLanguagesOverall;
}