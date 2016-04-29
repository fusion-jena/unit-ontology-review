"use strict";
/**
 * Create HTML output for coverage of baseTypes in the relations
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'coverage',
      moduleKey:  '9060'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function coverage() {

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Statistics XXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  // get coverage results
  var coverage = OntoStore.getResult( 'coverage' ),
      counts   = OntoStore.getResult( 'countBySynSet' );
  
  // get properties
  var prop = new Map();
  for( var onto in coverage ) {
    for( var type in coverage[onto] ) {
      
      // make sure there is an entry for this baseType
      if( !prop.has( type ) ) {
        prop.set( type, new Set() );
      }
      
      // get the entry for this base type
      var propSet = prop.get( type );
      
      // add all relations
      Object.keys( coverage[ onto ][ type ] )
            .forEach( (rel) => {
              propSet.add( rel );
            });
    }
  }
  
  // prepare table header
  var out = [ '<table class="firstColHeader"><tr><th></th><th></th>' ];
  var ontos = Object.keys( coverage );
  ontos.forEach( (onto) => {
          out.push( '<th><ul><li data-onto="', onto, '">', onto, '</ul></th>' );
        });
  out.push( '</tr>' );
  
  // add table rows
  prop.forEach( (relations, type) => {

    // type name in counts
    var countType = 'map' + type.charAt(0).toUpperCase() + type.slice(1);
    
    // first row
    out.push( '<tr><th rowspan="', relations.size + 1, '">', type, '</th><td><b>total</b></td>' );
    ontos.forEach( (onto) => {
      out.push( '<td>', counts[ onto ][ countType ], '</td>' );
    });
    out.push( '</tr>' );
    
    // other rows
    relations.forEach( (rel) => {
      
      out.push( '<tr><td><b>', rel, '</b></td>' );
      ontos.forEach( (onto) => {
        if( (type in coverage[ onto ]) && (rel in coverage[ onto ][ type ]) ) {
          out.push( '<td>', getSymbol( coverage[ onto ][ type ][ rel ], counts[ onto ][ countType ] ), ' ', coverage[ onto ][ type ][ rel ], '</td>' );
        } else {
          out.push( '<td>-</td>' ); 
        }
      });
      out.push( '</tr>' );
      
    })
    
  });
  
  out.push( '</table>' );
  
  // write results to file
  log( 'written output: statistics' );
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('')
  });
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Details XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // get data about missing relations
  var missing = OntoStore.getResult( 'coverage_missing' );
  
  // do output
  var out = [];
  Object.keys( missing)
    .forEach( (onto) => {
    
      out.push( '<h2><ul><li data-onto="', onto, '">', onto, '</ul></h2><ul>' );
      
      Object.keys( missing[ onto ] )
        .forEach( (type) => {
        
          out.push( '<li><h3>', type, '</h3><ul>' );
          
          // type name in counts
          var countType = 'map' + type.charAt(0).toUpperCase() + type.slice(1);

          Object.keys( missing[ onto ][ type ] )
            .forEach( (relation) => {
              
              // shortcut
              var list = missing[ onto ][ type ][ relation ].slice( 0 );
              list.sort();
              
              // skip empty lists
              if( list.length < 1 ){
                return;
              }
              
              out.push( '<li><h4>', relation, ' ( ', list.length, ' / ', counts[ onto ][ countType ], ' )</h4><ul data-collapsible="true">' );
              
              list.forEach( (uri) => {
                out.push( '<li><a href="', uri, '">', uri, '</a>' );
              });
              
              out.push( '</ul>' );

            });

          out.push( '</ul>' );
          
        });

      out.push( '</ul>' );
      
    });
  
  // write results to file
  log( 'written output: details' );
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName + '_missing', {
    content: out.join('')
  });
  
  // done
  return Q( true );    

}


/**
 * create a small indicator for the coverage
 * @param count
 * @param total
 * @returns
 */
function getSymbol( count, total ) {
  
  // set default value
  count = count || 0;
  
  // calculate fraction
  var frac = count / total;
  
  // determine color
  var color;
  switch( true ) {
  
    case frac >= 1:     color = 'green'; break;
    case frac  > 0.5:   color = 'yellow'; break;
    case frac  > 0:     color = 'orange'; break;
    default:            color = 'red'; break;
  }
  
  if( frac >= 1 ) {
    return '<span style="padding: 0.1em;border: 1px solid black;background-color: #A4A4A4;color:' + color + '">&#10003;</span>';
  } else {
    return '<span style="padding: 0.1em;border: 1px solid black;background-color: #A4A4A4;color:' + color + '">&#10007;</span>';
  }
  
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  coverage().done(); 
} else { 
  module.exports = coverage; 
}