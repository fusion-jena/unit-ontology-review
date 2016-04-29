"use strict";
/**
 * specify the structure and the default values for the sparql results
 * 
 * null values should exist, but have no default
 */
module.exports = {
    
    'appArea': {
      'appArea': null,
      'label': null
    }, 
    
    'appAreaQuantKind': {
      'appArea': null, 
      'quantKind': null
    },
    
    'appAreaUnit': {
      'appArea': null, 
      'unit': null
    },
    
    'conversion': {
      'unit1': null,
      'unit2': null,
      'convFactor': null,
      'convOffset': null
    },

    'dimension': {
      'dimension': null,
      'label': null,
      'dimLength': OPTIONAL,
      'dimMass':   OPTIONAL,
      'dimTime':   OPTIONAL,
      'dimElec':   OPTIONAL,
      'dimThermo': OPTIONAL,
      'dimAmount': OPTIONAL,
      'dimLum':    OPTIONAL
    },
    
    'dimensionUnit': {
      'dimension': null,
      'unit': null
    },
    
    'prefix': {
      'prefix': null,
      'label':  null,
      'factor': OPTIONAL
    },
    
    'prefixUnit': {
      'unit': null,
      'prefix': OPTIONAL,
      'baseUnit': OPTIONAL
    },

    'quantKind': {
      'quantKind': null,
      'label': null,
      'parent': null
    },
        
    'quantKindUnit': {
      'quantKind': null,
      'unit': null
    },
    
    'sameAs': {
      'object': null,
      'sameAs': null
    },
    
    'system': {
      'system': null,
      'label': null
    },
    
    'systemUnit': {
      'system': null,
      'unit': null
    },
    
    'unit': {
      'unit': null,
      'label': null,
      'symbol': null,
      'definition': OPTIONAL
    },
    
    // used for optional fields as a comparison
    'OPTIONAL': OPTIONAL 
};

function OPTIONAL(){}