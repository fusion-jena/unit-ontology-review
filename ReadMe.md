[![DOI](https://zenodo.org/badge/22096/fusion-jena/unit-ontology-review.svg)](https://zenodo.org/badge/latestdoi/22096/fusion-jena/unit-ontology-review)

The included scripts enable an evaluation of ontologies in the field of measurement units.
For an general overview please refer to File and Folder Structure.

# Dependencies

* [NodeJS](https://nodejs.org/) at least version 5
* [Sesame](http://rdf4j.org/)

# Installation

* Install JavaScript dependencies listed in `/analysis/packages.json` using `npm install`.
* Create a `Native Java Store RDF Schema` repository (default name: `units`) in Sesame.
* Create a configuration file `/analysis/config/config.js` (copy `/analysis/config/config.default.js`) and set the URL of the Sesame SPARQL endpoint.

# Running

To actually run the scripts, there are a few different options:

1. Each file can be run individually. Note, that in this case the results of all dependencies have to be present in the `/res` folder.
2. `0000 runAllScripts.js` will run all the scripts in their required order. As this included the extraction of individuals, please make sure a Sesame store is available and configured in `/analysis/config/config.js `
3. If a certain number of scripts at the start should be skipped, please use `0010 runFromScript.js` and as a parameter add the (number of the) first script to run.
To skip just the extraction of individuals, please use
`node 0010 runFromScript.js 1000`
4. If only a specific sequence of scripts should be run, use `0020 runScripts.js` and add as parameters the numbers for all scripts to be run. Note, that this will not check for any dependencies, so managing them is up to the user. An example refreshing the mapping units and their output to HTML might look like
`node 0020 runScripts.js 4100 9100 9101`

# File and Folder Structure

Files are generally placed under the following subfolders:

* `/analysis` Actual analysis scripts
* `/analysis/config` Configuration files
* `/analysis/templates`  HTML templates used for output generation
* `/data` Input data for the scripts to use. This includes the manual mapping files given as CSV.
* `/data/[Ontology]`  Input data for a specific ontology
* `/data/[Ontology]/src`  OWL definition files for the respective ontology
* `/data/[Ontology]/sparql` SPARQL queries for extraction of individuals. Each in a seperate file named after the respective concept or relation.
* `/data/[Ontology]/js` Some ontologies needed specific treatment, which is encoded in JS, that are used as hooks. Currently there is just one hook available "unit_beforeAddLabel", which is applied, before attaching a label to any object (refer to the example given in `/data/MUO/js`).
* `/res`  Output folder for all intermediate and result files.

The numbering of scripts roughly follows the approach given in the paper, but also adds some implementation specific sections.
Furthermore, the number signals the execution order of scripts.
For dependencies of the scripts please run `0100 listFiles.js` and refer to the respective output.

* 0000 - 0499 administrative scripts, e.g., used to control execution of scripts 
* 0500 - 0999 extraction of individuals
* 1000 - 1999 validation of extraction results
* 2000 - 2999 convert extracted individuals to internally used data objects
* 3000 - 3999 intra-ontology checks and statistics
* 4000 - 4999 mapping of individuals
* 5000 - 5999 gathering inter-ontology data and do inter-ontology checks
* 6000 - 6999 gathering inter-ontology statistics
* 9000 - 9999 create HTML output for review

# Obtaining Ontology files

For reasons of licensing we can only provide the SPARQL queries used to extract the individuals, but not the ontology files themselves. Please refer to the respective ontologies to obtain the required files:

* MUO: http://idi.fundacionctic.org/muo/
* OBOE: https://semtools.ecoinformatics.org/oboe
* OM: http://www.wurvoc.org/vocabularies/om-1.8/
* QU: https://www.w3.org/2005/Incubator/ssn/ssnx/qu/
* QUDT: http://www.qudt.org/
* SWEET: http://sweet.jpl.nasa.gov/
* UO + PATO: http://purl.obolibrary.org/obo/uo.owl + http://purl.obolibrary.org/obo/pato.owl

# Acknowledgments

Part of this work was funded by DFG in the scope of the LakeBase project within the Scientific Library Services and Information Systems (LIS) program.
