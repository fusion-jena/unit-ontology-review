"use strict";
/**
 * check, whether the given SemObject should belong in the given SynSet
 * 
 * currently checks for a match between the respective label sets
 * 
 * @param   {SemObject}   value
 * @param   {SynSet}      synset
 * @returns {Boolean}
 */
function belongsToSet( value, synset ) {
  
  let sLabels, vLabels, sLabelsNeutral, vLabelsNeutral;
  
  // get list of languages for value and synset
  const vLang = value.getLabelLanguages(),
        sLang = synset.getLabelLanguages();
  
  // is one operand just has '' and '_uri' for languages, 
  // we compare all labels to one another
  if(    ((vLang.length == 2) && vLang.includes( '' )) 
      || ((sLang.length == 2) && sLang.includes( '' ))) {
    
    // get labels
    vLabels = value.getLabels();
    sLabels = synset.getLabels();
    
    // compare
    return containsLabel( vLabels, sLabels );

  }
  
  // find common languages
  let languages = vLang.filter( (l) => sLang.includes(l) );

  // get neutral sets of labels ( '', '_uri' )
  vLabelsNeutral = value.getLabels(  '_uri', true );
  sLabelsNeutral = synset.getLabels( '_uri', true );
  
  // check for hit within the neutrals
  if( containsLabel( vLabelsNeutral, sLabelsNeutral ) ) {
    return true;
  }
  
  // check all labels per language
  let lang;
  for( let i=0; i<languages.length; i++ ) {
    
    // shortcut
    lang = languages[i];
    
    // get label sets
    vLabels = value.getLabels( lang ),
    sLabels = synset.getLabels( lang );

    // compare
    if(     containsLabel( vLabels, sLabels ) 
        ||  containsLabel( vLabels, sLabelsNeutral )
        ||  containsLabel( vLabelsNeutral, sLabels ) 
        ||  containsLabel( vLabelsNeutral, sLabelsNeutral ) ) {
      return true;
    }

  }
  
  // no hit, so the value does not belong to the SynSet
  return false;
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
           // either contains the label itself
    return labelsB.includes( l )
           // or the same without spaces
           || labelsB.includes( l.replace( /\s/g, '' ) );
  });

}


module.exports = belongsToSet;