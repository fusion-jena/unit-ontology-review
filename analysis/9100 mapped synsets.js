"use strict";
/**
 * Create HTML outputs for mapped SynSets
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'mappedSynSets',
      moduleKey:  '9100'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    types = {
      'mapDimension': 'dimension',
      'mapUnit':      'unit',
      'mapAppArea':   'appArea',
      'mapQuantKind': 'quantKind',
      'mapSystem':    'system',
      'mapPrefix':    'prefix'
    };


function mappedSynSets() {
  
  // process all types
  Object.keys( types ).forEach( (type) => {
    
    // get mapped synsets
    var mapping = OntoStore.getResult( type );
    
    // extract shown data
    var data = mapping.map( function( synset ){
      
      // get all members
      var syns = synset.getSynonyms();
      
      // get representative node (== first node)
      var rep = syns[0];
      
      return {
        'label': rep.getDisplayLabel(),
        'objs': syns.map( function( syn ){
          return {
            onto: syn.getOntology(),
            uri:  syn.getURI(),
            label:syn.getDisplayLabel()
          };
        })
      };
      
    });
    
    // sort data by label
    data.sort( function( a, b ){
      return a.label.localeCompare( b.label );
    });
    
    // convert to HTML
    var html = data.map( function( entry ){
      
      // collect output parts
      var out = [ '<b>', entry.label, '</b><ul>' ];
      
      // all involved objects
      for( var obj of entry.objs ) {
        
        out.push( '<li data-onto="', obj.onto, '"><a href="', obj.uri, '">', obj.label, '<br>(', obj.uri, ')</a>' );
        
      }
      out.push( '</ul>' );
      
      // connect all parts
      return out.join( '' );
      
    });

    // write results to file
    TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName + '_' + types[ type ] , {
      content: html.join('')
    });
    
    // log
    log( 'written output for ' + types[ type ] );
    
  });
  
  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  mappedSynSets().done(); 
} else { 
  module.exports = mappedSynSets; 
}