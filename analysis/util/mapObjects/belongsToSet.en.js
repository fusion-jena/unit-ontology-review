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
  
  // check all labels
  var labels = value.getLabels( 'en', true ),
      label;
  for( let i=0; i<labels.length; i++ ) {

    // shortcut
    label = labels[i];
    
    // compare labels directly
    if( synset.hasLabel( label, 'en', true ) ) {
      return true;
    }
    
    // compare labels with spaces removed
    if( synset.hasLabel( label.replace( /\s/g, '' ), 'en', true ) ) {
      return true;
    } 
  }
  
  // no hit, so the value does not belong to the synset
  return false;
}


module.exports = belongsToSet;