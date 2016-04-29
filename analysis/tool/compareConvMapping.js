"use strict";

// includes
var OntoStore = require( '../util/OntoStore' );

// load both datasets
var oldMap = OntoStore.getResult( 'mapConversion1' ),
    newMap = OntoStore.getResult( 'mapConversion' );

// build a lookup of the first
var lookup = {};
oldMap.forEach( (mappedConv) => {
  
  mappedConv.forEach( (conv) => {
    
    lookup[ conv.conv.unit1 ] = lookup[ conv.conv.unit1 ] || {};
    lookup[ conv.conv.unit2 ] = lookup[ conv.conv.unit2 ] || {};
    
    lookup[ conv.conv.unit1 ][ conv.conv.unit2 ] = mappedConv;
    lookup[ conv.conv.unit2 ][ conv.conv.unit1 ] = mappedConv;

  });
  
});

// check new map
var newLookup = {};
newMap.forEach( (mappedConv) => {
  
  mappedConv.forEach( (conv) => {
    
    if( !lookup[ conv.unit1 ] ){
      console.log( 'missing in old: ' )
      console.log( conv );
      console.log( '----------------------------------------------')
      return;
    }
    
    if( !lookup[ conv.unit1 ][ conv.unit2 ] ) {
      console.log( 'missing in old: ' )
      console.log( conv );
      console.log( '----------------------------------------------')
      return;
    }

    newLookup[ conv.unit1 ] = newLookup[ conv.unit1 ] || {};
    newLookup[ conv.unit2 ] = newLookup[ conv.unit2 ] || {};
    
    newLookup[ conv.unit1 ][ conv.unit2 ] = mappedConv;
    newLookup[ conv.unit2 ][ conv.unit1 ] = mappedConv;
  });
  
});


oldMap.forEach( (mappedConv) => {
  
  mappedConv.forEach( (conv) => {
    
    if( !newLookup[ conv.conv.unit1 ] ){
      console.log( 'missing in new: ' )
      console.log( conv.conv );
      console.log( '----------------------------------------------')
      return;
    }
    
    if( !newLookup[ conv.conv.unit1 ][ conv.conv.unit2 ] ) {
      console.log( 'missing in new: ' )
      console.log( conv.conv );
      console.log( '----------------------------------------------')
      return;
    }

  });
  
});