"use strict";
/**
 * Create HTML output for languages missing in labels per ontology and type
 *
 * output:
 * - "check - missing languages in labels" ... list of languages missing in labels per ontology and type
 */

// includes
var Fs          = require( 'fs' ),
    Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'check - missing languages in labels',
      moduleKey:  '9751'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkMissingLanguagesInLabels() {

  // log
  log( 'writing output for missing languages labels' );

  // get list of unrecognized prefixed units
  var missing = OntoStore.getResult( 'check - missing languages in labels' );

  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // build output
  var output = [];
  ontos.forEach( (onto) => {

      // no entry, no output
      if( !(onto in missing ) ) {
        return;
      }

      // collect output parts
      var out = [ '<h2><ul><li data-onto="', onto, '">', onto, '</ul></h2><ul>' ];

      // for each type
      Object.keys( missing[ onto ] )
            .forEach( (type) => {
              
              // get values
              var values = Object.keys( missing[ onto ][ type ] );
              values.sort();
              
              // skip, if no data present for ontology
              if( values.length < 1 ) {
                return;
              }
            
              out.push( '<li><h3>' + type + '</h3><ul>' );
              
              // for each language
              values.forEach( (lang) => {
                      
                      var values = missing[ onto ][ type ][ lang ].slice( 0 );
                      values.sort();

                      if( lang != '_missing' ) {
                        out.push( '<li><h4>' + lang + ' (' + values.length + ')</h4><ul data-collapsible="true">' );
                      } else {
                        out.push( '<li><h4>No label of any language (' + values.length + ')</h4><ul data-collapsible="true">' );
                      }
                                            
                      for( var i=0; i<values.length; i++ ) {
                        out.push( '<li>' + values[i] );
                      }
                      
                      out.push( '</ul>' );
                      
                    });
              
              out.push( '</ul>' );
            });
            

      out.push( '</ul>' );

      // add to output
      output.push( out.join('') );

    });

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: output.join('')
  });

  // log
  log( 'written output' );

  // done
  return Q( true );

}


/**
 * get a list of all types present in the object (== 2nd level keys)
 * @param   obj
 * @returns {Array[String]}
 */
function getTypes( obj ){
  
  var result = new Set;
  
  Object.keys( obj )
        .forEach( (key) => {
                    
          Object.keys( obj[ key ] )
                .forEach( (type) => {
                  result.add( type );
                });

        });
  
  return [ ... result ];
  
}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkMissingLanguagesInLabels().done();
} else {
  module.exports = checkMissingLanguagesInLabels;
}