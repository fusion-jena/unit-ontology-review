"use strict";
/**
 * find individuals, that are lacking a label in a specific language, 
 * even though that language is specified for that type and ontology for over 30% of the individuals
 * (otherwise we get flooded by individuals from WD)
 * 
 * output:
 * - 'check - missing languages in labels'
 * 
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    Structure= require( './config/structure' );

// local settings
const localCfg = {
        moduleName: 'check - missing languages in labels',
        moduleKey:  '3751'
      },
      log = function( msg, type ) {
        Log( localCfg.moduleName, msg, type );
      },
      skip = [ '_total', '_uri', '_missing' ],      // skip artificially introduced "languages"
      OCC_THRESHOLD = 0.3;


function statisticMissingLanguagesInLabels() {

  // log
  log( 'find missing languages in labels' );

  // get list of types using labels
  var types = Object.keys( Structure )
                    .filter( (type) => {
                      return 'label' in Structure[ type ];
                    });
  
  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // get languages per type and ontology
  var langPresent = getLanguagesPresent();

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
      results[ onto ][ type ] = results[ onto ][ type ] || {};
      
      // get languages for labels in object
      var languages = obj.getLabelLanguages();

      if( (languages.length == 1) && (languages[0] == '_uri') ) {

        // no (natural language) label at all
        results[ onto ][ type ][ '_missing' ] = results[ onto ][ type ][ '_missing' ] || [];
        results[ onto ][ type ][ '_missing' ].push( obj.getURI() );
        
      } else {

        // compare with languages expected
        langPresent[ onto ][ type ]
          .forEach( (expectedLang) => {
            
            // see, if it is missing
            if( languages.indexOf( expectedLang ) < 0 ) {
              
              // add to list of missing languages
              results[ onto ][ type ][ expectedLang ] = results[ onto ][ type ][ expectedLang ] || [];
              results[ onto ][ type ][ expectedLang ].push( obj.getURI() );
              
            }
            
          });

      }
      
    }
    
  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  return Q( true );

}


/**
 * get the languages per type and ontology
 * @returns   {Object}
 */
function getLanguagesPresent(){

  // get language distribution
  const langDistr = OntoStore.getResult( 'statistic - label languages' );

  // convert to form "onto -> type -> [ languages ]"
  const result = {};
  Object.keys( langDistr )
        .forEach( (onto) => {
          
          result[ onto ] = {};
          
          Object.keys( langDistr[ onto ] )
                .forEach( (type) => {
                  result[ onto ][ type ] = Object.keys( langDistr[ onto ][ type ] )
                                                 .filter( (lang) => (skip.indexOf( lang ) < 0) );
                });
          
        });
  
  // only keep languages, that are present in over X% of the individuals of that type
  Object.keys( result )
        .forEach( (onto) => {
          
          Object.keys( result[onto] )
                .forEach( (type) => {
                  
                  // get total individuals in for that onto/type
                  const total = langDistr[ onto ][ type ]._total;
                  
                  // filter the languages
                  result[ onto ][ type ] = result[ onto ][ type ]
                                            .filter( (lang) => {
                                                      // include special values
                                              return  lang.startsWith( '_' )
                                                      // as well as languages which occur often enough
                                                      || langDistr[ onto ][ type ][ lang ] / total >= OCC_THRESHOLD;
                                            });
                })  
          
        })
  //OCC_THRESHOLD
  
  return result;
  
}




/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticMissingLanguagesInLabels().done();
} else {
  module.exports = statisticMissingLanguagesInLabels;
}