"use strict";
/**
 * Create HTML output for contents of the ontologies (per type) before mapping to SynSets
 *
 * output:
 * - "statistic - individuals per ontology after extraction" ... table of extracted individuals per ontology
 */

// includes
var Fs          = require( 'fs' ),
    Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'statistic - individuals per ontology after extraction',
      moduleKey:  '9000'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function statisticIndividualsPerOntologyAfterExtraction() {

  // get ontologies
  var ontos = OntoStore.getOntologies();

  // build data-array: add header row
  var data  = [],
      row   = [ '&nbsp;' ];
  for( var i=0; i<ontos.length; i++ ) {
    row.push( ontos[i] );
  }
  data.push( row );


  // add counts from SPARQL query results
  addCounts( OntoStore.getResult( 'statistic - individuals per ontology after extraction' ), ontos, data );

  // add counts from prefixes
  addCounts( OntoStore.getResult( 'statistic - prefixed units after extraction' ), ontos, data );

  // convert array to table
  var out = [ '<table>' ];
  for( var i=0; i<data.length; i++ ) {
    out.push( '<tr>' );
    for( var j=0; j<data[i].length; j++ ) {

      if( j == 0 ) {
        out.push( '<th>', data[i][j], '</th>');
      } else if( i == 0 ) {
        out.push( '<th><ul><li data-onto="' +  data[i][j] + '">',  data[i][j], '</ul></th>');
      } else {

        var klass = data[i][j] > 0 ? 'green' : 'red';

        out.push( '<td class="' + klass + '">', data[i][j], '</td>' );
      }

    }
    out.push( '</tr>' );
  }
  out.push( '</table>' );

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('\n')
  });

  // done
  return Q( true );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


/**
 * add the result from a counts file to the global result
 */
function addCounts( src, ontos, result ) {

  // get relations
  var types = Object.keys( src[ ontos[0] ] ).sort();

  // assemble all entries in array
  for( var i=0; i<types.length; i++ ) {

    var row = [ types[i] ];

    for( var j=0; j<ontos.length; j++ ) {
      row.push( src[ ontos[j] ][ types[i] ] );
    }

    result.push( row );
  }

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticIndividualsPerOntologyAfterExtraction().done();
} else {
  module.exports = statisticIndividualsPerOntologyAfterExtraction;
}