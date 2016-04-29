"use strict";
/**
 * Create HTML output for mismatches in conversions
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' ),
    math        = require( 'mathjs' );

// local settings
var localCfg = {
      moduleName: 'checkConversion',
      moduleKey:  '9350'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkConversion() {
  
  // get unit synsets
  var units = OntoStore.getResult( 'mapUnit' );
  
  // create a unit lookup
  var unitLookup = {};
  var lookup = {};
  for( var i=0; i<units.length; i++ ) {
    
    // shortcut
    var synset = units[i];
    
    // add to lookup
    for( var unit of synset.getSynonyms() ) {
      unitLookup[ unit.getURI() ] = synset;
    }
    
  }

  // call for actual mismatches
  var mismatches = OntoStore.getResult( 'checkConversion' ).slice( 0 );
  printToHTML( mismatches, localCfg.moduleName, unitLookup );
  
  // call for rounded values
  var mismatches = OntoStore.getResult( 'checkConversion_rounded' ).slice( 0 );
  printToHTML( mismatches, localCfg.moduleName + ' rounded', unitLookup );
  
  // done
  return Q( true );    

}


/**
 * convert the given list of mismatches to HTML output and write to the given file
 * @param mismatches
 * @param filename
 * @param unitLookup
 * @returns
 */
function printToHTML( mismatches, filename, unitLookup ) {
  
  // order by display label of first unit
  mismatches.sort( (a,b) => {
    
    // get the labels from the first entry
    var labelA = unitLookup[ a[0].unit1 ].getDisplayLabel(),
        labelB = unitLookup[ b[0].unit1 ].getDisplayLabel();
    
    // compare
    return labelA.localeCompare( labelB );
  });
    
  // prep table header
  var out = [ '<table class="firstColHeader"><tr>',
                '<th>Conversion</th>',
                '<th>Ontology</th>',
                '<th>Direction</th>',
                '<th>Factor</th>',
                '<th>Offset</th>',
                '<th>Computed</th>',
               '</tr>' ];
  
  // add entries
  for( var entry of mismatches ) {

    // get involved units by first conv
    var conv = entry[0],
        unit1 = unitLookup[ conv.unit1 ],
        unit2 = unitLookup[ conv.unit2 ];
    
    // get labels for the respective units
    var label1 = unit1.getDisplayLabel(),
        label2 = unit2.getDisplayLabel();
    
    // add unit cell
    out.push( '<tr><th rowspan="', entry.length, '">', label1, ' &harr; ', label2, '</th>' );

    // add first conversions
    out.push( '<td><ul><li data-onto="', conv.onto, '">', conv.onto, '</ul></td>',
              '<td style="font-size: 200%;">', conv.reverse ? ' &larr; ' : ' &rarr; ', '</td>',
              '<td>', printNumber( conv.convFactor, true ), '</td>',
              '<td>', printNumber( conv.convOffset ), '</td>',
              '<td>', printInvolved( unitLookup, conv.involved ), '</td>' );
    out.push( '</tr>' );
    
    // add other conversions
    for( var i=1; i<entry.length; i++ ) {
      
      out.push( '<tr>',
                  '<td><ul><li data-onto="', entry[i].onto, '">', entry[i].onto, '</ul></td>',
                  '<td style="font-size: 200%;">', entry[i].reverse ? ' &larr; ' : ' &rarr; ', '</td>',
                  '<td>', printNumber( entry[i].convFactor, true ), '</td>',
                  '<td>', printNumber( entry[i].convOffset ), '</td>',
                  '<td>', printInvolved( unitLookup, entry[i].involved ), '</td>',
                '</tr>' );
    }
  }
  out.push( '</table>' );
  
  
  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, filename, {
    content: out.join('')
  });
  
  // log
  log( 'written file: ' + filename );
  
}

/**
 * convert the list of involved units to HTML ouput
 * @param   {Array}   involved
 * @returns {String}
 */
function printInvolved( unitLookup, involved ) {
  
  // no other involved units
  if( !involved ) {
    return '';
  }

  var out = [ '<div><span class="tooltip">&#10133;<div><ul>' ];
  for( var i=0; i<involved.length; i++ ) {
    
    // get unit labels
    var label1 = unitLookup[ involved[i].unit1 ].getDisplayLabel(),
        label2 = unitLookup[ involved[i].unit2 ].getDisplayLabel();
    
    // add to output
    out.push( '<li>', label1, ' &rarr; ', label2, ': *', involved[i].convFactor, ' + ', involved[i].convOffset, '<br>' );
  }
  out.push( '</ul></div></span></div>' );
  
  return out.join('');
}

/**
 * format the given number
 * @param     {String}  number
 * @returns   {String}
 */
function printNumber( number, isFactor ) {
  
  // missing number
  if( typeof number == 'undefined' ) {
    if( isFactor ) {
      return '1';
    } else {
      return '0'; 
    }
  }
  
  // parse with mathjs
  var n = math.bignumber( number );
  
  // find the first significant digit
  var comp = math.bignumber( 1 ),
      prec = 0,
      abs = math.abs( n );
  if( !math.equal( 0, n ) ) {
    while( math.compare( comp, abs ) > 0 ) {
      prec += 1;
      comp = math.divide( comp, 10 );
    }
  }
  prec = Math.max( 15, prec );
  
  // format the number
  var str = math.format( n, { notation: 'fixed', precision: prec } );
  
  // if a decimal point is in the number, remove all trailing zeros behind it
  if( str.indexOf( '.' ) > -1 ) {
    
    // http://stackoverflow.com/a/8791437/1169798
    str = str.replace( /0+$/, '' );
    
    if( str[ str.length - 1 ] == '.' ) {
      str = str.substring( 0, str.length - 1 );
    }

  }

  return str;
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkConversion().done(); 
} else { 
  module.exports = checkConversion; 
}