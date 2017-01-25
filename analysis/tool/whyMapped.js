"use strict";
/**
 * get information how a certain synset got mapped to one another
 * 
 * results in a matrix view showing which of the elements are mapped to one another in which language
 * 
 * input is 
 * - TYPE ... type of the SynSet
 * - URI  ... one URI represented in the SynSet
 * - ONTO ... limit the comparisons to a specific ontology
 */

// set input
const TYPE = 'System',
      URI  = 'http://www.wikidata.org/entity/Q16782623',
      ONTO = false;

// includes
const OntoStore = require( './../util/OntoStore' );

// constants
const COLWIDTH1 = 3;      // width of the first column

// load respective mapped dataset
const data = OntoStore.getResult( 'map' + TYPE );

// find the referred SynSet
const synset = data.find( (synset) => {
  return synset.getSynonyms().some( (syn) => syn.getURI() == URI );
});

// get synonyms ordered by ontology
const syns = synset
              .getSynonyms()
              .filter( (entry) => ONTO ? (entry.getOntology() == ONTO) : true )
              .sort( (a,b) => a.getOntology().localeCompare( b.getOntology() ) );

// compute mapp matrix
let matrix = [];
syns.forEach( (s1) => {
  
  // initialize a row
  const row = [];
  matrix.push( row );
  
  // create row entries
  syns.forEach( (s2) => {
   
    // short circuit for diagonal
    if( s1 == s2 ) {
      row.push( '-' );
      return;
    }

    // get connecting language label
    row.push( getConnector( s1, s2 ) );
    
  });
});

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Output XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// legend
for( let i=0; i<syns.length; i++ ) {
  console.log( i + ' - ' + syns[i].getDisplayLabel() + '  (' + syns[i].getOntology() + ' - ' + syns[i].getURI() + ')' );
}
console.log( '\n\n' );

// get max column lengths
const colLength = [];
for( let i=0; i<matrix.length; i++ ) {
  colLength[ i ] = matrix[i]
                      .map( (el) => (''+el).length )
                      .reduce( (max, len) => Math.max( max, len ), COLWIDTH1 );
  
  // add some padding
  colLength[ i ] += 2;
}

// total length
const totalLength = 3 + 3 * syns.length + colLength.reduce( (sum,l) => sum + l, 0 );

// print table - head
let row =  [ createString( COLWIDTH1 ), ... syns.map( (el, ind) => '' + ind ).map( (el, ind) => el + createString( colLength[ ind ] - el.length ) ) ];
console.log( row.join( ' | ' ) );
console.log( createString( totalLength, '-' ) );

// print rows
for( let i=0; i<matrix.length; i++ ) {
  
  // first column is the index
  row = [ i + createString( COLWIDTH1 - ('' + i).length ) ];
  
  // rest is actual content
  matrix[i].forEach( (cell, ind) => {
    const label = '' + cell;
    row.push( label + createString( colLength[ ind ] - label.length ) );
  });
  
  // output
  console.log( row.join( ' | ' ) );
  console.log( createString( totalLength, '-' ) );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * create a string with the requested number of characters given by char
 */
function createString( number, char ) {
  char = char || ' ';
  return (new Array( number + 1 )).join( char );
}

/**
 * find the connecting languages for the given SemObjects
 * 
 * resembles structure from util/mapObjects
 */
function getConnector( s1, s2 ) {

  let comp;
  
  // get list of languages for value and synset
  const s1Lang = s1.getLabelLanguages(),
        s2Lang = s2.getLabelLanguages();
  
  // find common languages
  const languages = s1Lang.filter( (l) => s2Lang.includes(l) );
 
  // check all labels per language
  let lang;
  for( let i=0; i<languages.length; i++ ) {
    
    // shortcut
    lang = languages[i];
    
    // compare
    comp = compareByLang( s1, s2, lang, lang );    
    if( comp !== false ) {
      return comp;
    }

  }
  
  // if we are here, no hit within a single language
  // so we check whether _uri or '' match against the other languages
  for( let i=0; i<s2Lang.length; i++ ) {
    comp =    compareByLang( s1, s2, '', s2Lang[i] )
           || compareByLang( s1, s2, '_uri', s2Lang[i] );
    if( comp !== false ) {
      return comp;
    }
  }
  for( let i=0; i<s1Lang.length; i++ ) {
    comp =    compareByLang( s1, s2, s1Lang[i], '' )
           || compareByLang( s1, s2, s1Lang[i], '_uri' );
    if( comp !== false ) {
      return comp;
    }
  }
  
  // no hit
  return '';
  
}

/**
 * compare both SemObject by the respective given languages 
 */
function compareByLang( s1, s2, lang1, lang2 ) {
  
  // get label sets
  const s1Labels = s1.getLabels( lang1 ),
        s2Labels = s2.getLabels( lang2 );
  
  // short circuit
  if( s1Labels.length < 1 || s2Labels.length < 1 ) {
    return false;
  }

  // compare
  if( containsLabel( s1Labels, s2Labels ) ) {
    return lang1 == lang2 ? lang1 : (lang1 + '>' + lang2);
  } else {
    return false;
  }
}

/**
 * checks for the presence of labels from labelsA in labelsB
 * 
 * @param     {Array[String]}   labelsA 
 * @param     {Array[String]}   labelsB
 * @returns   {Boolean}
 */
function containsLabel( labelsA, labelsB ) {
  
  // compare
  return labelsA.some( (l) => {
    return labelsB.includes( l );
  });

}