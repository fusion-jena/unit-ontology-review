"use strict";
/**
 * Create HTML output for possibly imprecise units
 * 
 * example: gallon vs gallon US vs gallon UK
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'impreciseUnits',
      moduleKey:  '9550'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function impreciseUnits() {

  // get results
  var sets = OntoStore.getResult( 'impreciseUnits' ).slice( 0 );

  // sort
  sets.sort( (a,b) => {
    return a.label.localeCompare( b.label );
  });
  
  // create output
  var out = [];
  for( var set of sets ) {
    
    // add header
    out.push( '<h2>', set.label, '</h2>' );
    
    // add all SynSet and their members
    out.push( '<ul>' );
    for( var synset of set.units ) {
      
      out.push( '<li><b>', synset.getDisplayLabel() , '</b><ul data-collapsible="true">' );
      
      // add all synonyms of that SynSet
      for( var syn of synset.getSynonyms() ) {
        out.push( '<li data-onto="', syn.getOntology(), '"><a href="', syn.getURI(), '">', syn.getDisplayLabel(), '<br>(', syn.getURI(), ')</a>' );
      }
      
      out.push( '</ul>' );
    }
    out.push( '</ul>' );
    
    
  }
  
  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('')
  });
  
  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  impreciseUnits().done(); 
} else { 
  module.exports = impreciseUnits; 
}