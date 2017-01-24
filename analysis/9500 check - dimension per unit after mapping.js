"use strict";
/**
 * Create HTML output for cross validate unit mapping and dimension mapping
 * using the dimensionUnit association
 *
 * output:
 * - "check - dimension per unit after mapping" ... list of instances, where a unit SynSet is associated with more than one dimension SynSet
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'check - dimension per unit after mapping',
      moduleKey:  '9500'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkDimensionPerUnitAfterMapping() {

  // get mismatches
  var mismatches = OntoStore.getResult( 'check - dimension per unit after mapping' );

  // no input file, not output file
  if( !mismatches ) {
    TemplStore.remResult( localCfg.moduleKey, localCfg.moduleName );
    return Q(true);
  }

  // fill table
  var out = [ '<table class="leftAligned"><tr><th>Unit SynSet</th><th>Dim SynSets</th></tr>' ];
  for( var entry of mismatches ) {

    // get the members of the SynSet
    var syns = entry.unit.getSynonyms();

    // output header for the SynSet
    out.push( '<tr><td><b>', syns[0].getDisplayLabel(), '</b><ul>' );

    // list all involved entities
    for( var syn of syns ) {
      out.push( '<li data-onto="' + syn.getOntology() + '"><a href="' + syn.getURI() + '">', syn.getURI(), '</a>' );
    }

    out.push( '</ul></td><td><ul>' );

    // add dimension synsets
    entry.dims.forEach( (synset) => {

      // get synonyms
      var dims = synset.getSynonyms();

      // output label of the SynSet
      out.push( '<li>', dims[0].getDisplayLabel(), '<ul>' );

      // list all involved dimensions
      dims.forEach( (dim) => {
             out.push( '<li data-onto="' + dim.getOntology() + '"><a href="' + dim.getURI() + '">', dim.getURI(), '</a>' );
           });

      // close list
      out.push( '</ul>' );
    });
    out.push( '</ul></td></tr>' );

  }
  out.push( '</table>' );

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('\n')
  });

  // done
  return Q( true );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkDimensionPerUnitAfterMapping().done();
} else {
  module.exports = checkDimensionPerUnitAfterMapping;
}