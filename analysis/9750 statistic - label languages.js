"use strict";
/**
 * Create HTML output for the languages used in labels per ontology and type
 *
 * output:
 * - "statistic - label languages" ... table of languages used per ontology and type
 */

// includes
var Fs          = require( 'fs' ),
    Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'statistic - label languages',
      moduleKey:  '9750'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    renames = {
        '_total':   'total',
        '_missing': 'missing',
        '_uri':     null,         // not included in result
        '':         'unknown'
    };


function statisticLabelLanguages() {

  // log
  log( 'writing output for language distribution in labels' );
  
  // get ontologies
  var ontos = OntoStore.getOntologies();
  
  // build data-array: add header row
  var data  = [],
      row   = [ '&nbsp;' ];
  for( var i=0; i<ontos.length; i++ ) {
    row.push( ontos[i] );
  }
  data.push( row );

  // get language distribution
  var langDist = OntoStore.getResult( 'statistic - label languages' );

  // get list of covered types
  var types = getTypes( langDist );
  types.sort();

  // add to data array
  for( var type of types ) {
    
    // init row
    row = [ type ];
    
    // add for each ontology
    for( var i=0; i<ontos.length; i++ ) {
      
      // get values
      var values = langDist[ ontos[i] ][ type ] || {};

      // add values to cell
      var cell = [];
      Object.keys( values )
            .sort()
            .forEach( (lang) => {
              
              // get value
              var value = values[ lang ];
              
              // check for renames
              if( lang in renames ) {
                lang = renames[ lang ];
              }
              
              // we skip some entries
              if( (lang === null) || 
                  ((lang == 'missing') && (value == 0)) ) {
                return;
              }
              
              // add class
              var klass = ((value < values._total) || (lang == 'missing')) ? 'red' : 'green';
              
              // add to cell
              cell.push( '<div class="' + klass + '">' + lang + ': ' + value + '</div>' );
              
            });
      
      // add cell to row
      row.push( cell.join( '' ) );
    }
    
    // add row
    data.push( row );
    
  }

  // convert array to table
  var out = [ '<table>' ];
  for( var i=0; i<data.length; i++ ) {
    out.push( '<tr>' );
    for( var j=0; j<data[i].length; j++ ) {

      if( j == 0 ) {
        out.push( '<th>', data[i][j], '</th>');
      } else if( i == 0 ) {
        out.push( '<th><ul><li data-onto="',  data[i][j], '">',  data[i][j], '</ul></th>');
      } else {
        out.push( '<td>', data[i][j], '</td>' );
      }

    }
    out.push( '</tr>' );
  }
  out.push( '</table>' );
  
  // add remark
  out.push( '<div class="comment"> \
                <i>total</i> is the total number of individuals for that type and ontology\
                <br>\
                <i>missing</i> is the number of individuals without any label\
            </div>' );

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join( '' )
  });

  // log
  log( '   ... done' );
  
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
  statisticLabelLanguages().done();
} else {
  module.exports = statisticLabelLanguages;
}