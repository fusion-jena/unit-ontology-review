"use strict";
/**
 * general settings for the project
 *
 * copy to config.js and adapt to your environment
 */
module.exports = {

    // base path to source data
    dataPath: __dirname + '/../../data/',

    // base path to target data
    targetPath: __dirname + '/../../res/',
    
    // path to templates
    templatePath: __dirname + '/../templates',

    // which rdfstore to use; vaild values currently just "http"
    rdfstore: 'http',

    // sparql endpoints; used in RDFStore.http.js
    // repository will be wiped clean!
    sparqlEndpointPost: 'http://localhost:8080/openrdf-sesame/repositories/units/statements',
    sparqlEndpointGet: 'http://localhost:8080/openrdf-sesame/repositories/units',
    
    // keep old result files, when executing the whole stack
    // will just change the content, but not recreate the file
    keepResultFiles: false,

};