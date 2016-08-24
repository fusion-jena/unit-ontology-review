"use strict";
/**
 * structure definition of the SPARQL results for the extraction of individuals
 */
module.exports = {

    // Field of application
    'appField': {
      'appField': REQUIRED,
      'label':    REQUIRED,
      'labelLang':REQUIRED
    },

    // Relation between Field of application and Kind of quantity
    'appFieldQuantKind': {
      'appField':  REQUIRED,
      'quantKind': REQUIRED
    },

    // Relation between Field of application and Measurement unit
    'appFieldUnit': {
      'appField': REQUIRED,
      'unit':     REQUIRED
    },

    // Conversion
    'conversion': {
      'unit1':      REQUIRED,
      'unit2':      REQUIRED,
      'convFactor': OPTIONAL,
      'convOffset': OPTIONAL
    },

    // Dimension
    'dimension': {
      'dimension': REQUIRED,
      'label':     REQUIRED,
      'labelLang': REQUIRED,
      'dimLength': OPTIONAL,
      'dimMass':   OPTIONAL,
      'dimTime':   OPTIONAL,
      'dimElec':   OPTIONAL,
      'dimThermo': OPTIONAL,
      'dimAmount': OPTIONAL,
      'dimLum':    OPTIONAL
    },

    // Relation between Dimension and Unit of Measurement
    'dimensionUnit': {
      'dimension':  REQUIRED,
      'unit':       REQUIRED
    },

    // Prefix
    'prefix': {
      'prefix': REQUIRED,
      'label':  REQUIRED,
      'labelLang': REQUIRED,
      'factor': OPTIONAL
    },

    // Relation between Prefix and Unit
    'prefixUnit': {
      'unit':     REQUIRED,
      'prefix':   REQUIRED,
      'baseUnit': OPTIONAL
    },

    // Kind of quantity
    'quantKind': {
      'quantKind':  REQUIRED,
      'label':      REQUIRED,
      'labelLang':  REQUIRED,
      'parent':     OPTIONAL
    },

    // Relation between Kind of quantity and Measurement unit
    'quantKindUnit': {
      'quantKind':  REQUIRED,
      'unit':       REQUIRED
    },

    // sameAs relations
    'sameAs': {
      'object': REQUIRED,
      'sameAs': REQUIRED
    },

    // System of units
    'system': {
      'system': REQUIRED,
      'label':  REQUIRED,
      'labelLang': REQUIRED,
    },

    // Relation between System of units and Measurement unit
    'systemUnit': {
      'system': REQUIRED,
      'unit':   REQUIRED
    },

    // Measurement unit
    'unit': {
      'unit':       REQUIRED,
      'label':      REQUIRED,
      'labelLang':  REQUIRED,
      'symbol':     OPTIONAL,
      'definition': OPTIONAL
    },

    // used for classification
    'OPTIONAL': OPTIONAL,
    'REQUIRED': REQUIRED
};

function OPTIONAL(){}
function REQUIRED(){}