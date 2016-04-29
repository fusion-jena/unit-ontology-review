"use strict";
/**
 * Create HTML output for contents of the ontologies (per type) before mapping to SynSets
 */

//includes
var Fs          = require( 'fs' ),
    Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'createCountTables.tex',
      moduleKey:  'a000'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    tableAssign = {
        appArea: 0,
        appAreaQuantKind: 1,
        appAreaUnit: 1,
        conversion: 0,
        dimension: 0,
        dimensionUnit: 1,
        prefix: 0,
        prefixUnit: 1,
        quantKind: 0,
        quantKindUnit: 1,
        sameAs: -1,
        system: 0,
        systemUnit: 1,
        unit: 0,
        unit_prefix_total: 0,
        unit_noprefix_total: 0
    },
    names = {
        appArea:      'field of application',
        quantKind:    'kind of quantity',
        system:       'system of units',
        unit:         'measurement unit',
        unit_prefix_total: 'prefixed unit',
        unit_noprefix_total: 'non-prefixed unit',
        appAreaQuantKind: 'field o.a. $\\Join$ kind o.q.',
        appAreaUnit: 'field o.a. $\\Join$ unit',
        dimensionUnit: 'dimension $\\Join$ unit',
        prefixUnit: 'prefix $\\Join$ unit',
        quantKindUnit: 'kind o.q. $\\Join$ unit',
        systemUnit: 'system o.u. $\\Join$ unit'
    },
    fileNames = {
        0: 'tableConcepts',
        1: 'tableRelations'
    },
    dependent = [];


function relationExistance() {
  
  // get ontologies
  var ontos = OntoStore.getOntologies();
  
  // build data-array: add header row
  var data  = [],
      row   = [ '' ];
  for( var i=0; i<ontos.length; i++ ) {
    row.push( '\\strut ' + ontos[i] );
  }
  data.push( row );
  var lookup = {};
  
  // add counts from SPARQL query results
  addCounts( OntoStore.getResult( 'count' ), ontos, data, lookup );
  
  // add computed counts
  addCounts( OntoStore.getResult( 'countPrefix' ), ontos, data, lookup );
  
  // add dependent values
  dependent.forEach( (variable) => {
    
    // collect all row entries
    var row = [ variable.name ];
    ontos.forEach( (onto) => {
      
      // compute value
      var value = variable.calc( lookup[ onto ] );
      
      // add to data
      row.push( value );
      
      // add to lookup
      lookup[ onto ] = lookup[ onto ] || {};
      lookup[ onto ][ variable.name ] = value;

    });
    
    // add to global result
    data.push( row );
    
  });
  
  // replace zeros by "-"
  data = data.map( (row) => {
    return row.map( (cell) => {
      return (cell == 0) ? '-' : cell;
    });
  });
  data[0][0] = '';
  
  // tex table header
  row = [];
  for( var i=0; i<ontos.length; i++ ) {
    row.push( 'X[1,m,c]' );
  }
  var head = [];
  head.push( data[0].join( ' & ' ) );
  head.push( "\\\\\n" );
  head.push( "\\hline\n" );
  
  // add data to tex table
  var tables = {};
  for( var i=1; i<data.length; i++ ) {
    
    var type = data[i][0];
    
    if( type in names ) {
      data[i][0] = names[ data[i][0] ];
    }
    
    row = data[i].join( ' & ' ) + "\\\\\n";
    
    var table = type in tableAssign ? tableAssign[ type ] : -1;
    tables[ table ] = tables[ table ] || [];
    tables[ table ].push( row );
  }
  
  // write to files
  var baseDir = __dirname + '/../res/';
  Object.keys( tables )
        .forEach( (ind) => {
    
          // shortcut
          var content = tables[ ind ];
          
          // add header and footer
          //content.unshift.apply( content, head );
          
          // write to file
          var filename = (ind in fileNames) ? fileNames[ind] : 'unused';
          Fs.writeFileSync( baseDir + filename + '.tex', content.join( '' ) );
          log( 'written ' + filename + '.tex' );
          
        });


  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


/**
 * add the result from a counts file to the global result
 */
function addCounts( src, ontos, result, lookup ) {
  
  // get relations
  var types = Object.keys( src[ ontos[0] ] ).sort();
  
  // assemble all entries in array
  for( var i=0; i<types.length; i++ ) {
    
    var row = [ types[i] ];
    
    for( var j=0; j<ontos.length; j++ ) {

      // add to data array
      row.push( src[ ontos[j] ][ types[i] ] );
      
      // add to lookup
      lookup[ ontos[j] ] = lookup[ ontos[j] ] || {};
      lookup[ ontos[j] ][ types[i] ] = src[ ontos[j] ][ types[i] ];
      
    }
    
    result.push( row );
  }
  
}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  relationExistance().done(); 
} else { 
  module.exports = relationExistance; 
}