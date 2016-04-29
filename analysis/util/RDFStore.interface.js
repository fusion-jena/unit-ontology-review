"use strict";

function RDFStore(){}

/**
 * create or initialize the store or connection there to
 */
RDFStore.prototype.create = function(){};

/**
 * empty the store
 */
RDFStore.prototype.truncate = function(){};

/**
 * add triples to the store
 * @param   {String}  mime      MIME type of the submitted content
 * @param   {String}  content   the triples
 * @returns {Number}            the amount of added triples
 */
RDFStore.prototype.addTriples = function( mime, content ){};

/**
 * execute a sparql query against this store
 * @param   {String}  query   the query to execute
 * @returns {Array}           the result
 */
RDFStore.prototype.execQuery = function( query ) {}

module.exports = RDFStore;