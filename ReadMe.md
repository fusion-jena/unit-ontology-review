[![DOI](https://zenodo.org/badge/22096/fusion-jena/unit-ontology-review.svg)](https://zenodo.org/badge/latestdoi/22096/fusion-jena/unit-ontology-review)

The included scripts enable an evaluation of ontologies in the field of measurement units.
For an general overview please refer to File and Folder Structure.

# Dependencies

* [NodeJS](https://nodejs.org/) at least version 7
* [Sesame](http://rdf4j.org/)

# Installation

1. Install JavaScript dependencies listed in `/analysis/packages.json` using `npm install`.
2. Create a `Native Java Store RDF Schema` repository (default name: `units`) in Sesame.
3. Create a configuration file `/analysis/config/config.js` (copy `/analysis/config/config.default.js`) and set the URL of the Sesame SPARQL endpoint.
4. Add the files of the [ontologies](#obtaining-ontology-files) into the respective folder (see [File and Folder Structure](#file-and-folder-structure))

If no SPARQL endpoint is available, the results of the extraction of individuals can be used alternatively:

2. Download the archive of the [precomputed results of the extraction of individuals](#precomputed-results)
3. Extract the contents of the archive into `/res`

Now the extraction scripts can be skipped and execution can start with script `1000 check - prefixUnit duplicates.js`. Further scripts do not require a SPARQL endpoint.

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
* `/data/[Ontology]/sparql` SPARQL queries for extraction of individuals. Each in a separate file named after the respective concept or relation.
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
* a000 - a999 additional scripts to create special output for further usage, not executed by default

# Obtaining Ontology files

For reasons of licensing we can only provide the SPARQL queries used to extract the individuals, but not the ontology files themselves. Please refer to the respective ontologies to obtain the required files:

* MUO: http://idi.fundacionctic.org/muo/
* OBOE:  https://code.ecoinformatics.org/code/semtools/trunk/dev/oboe/
* OM: http://www.wurvoc.org/vocabularies/om-1.8/
* OM2:  https://github.com/HajoRijgersberg/OM
* QU: https://www.w3.org/2005/Incubator/ssn/ssnx/qu/
* QUDT: http://www.qudt.org/
* SWEET2: http://sweet.jpl.nasa.gov/
* SWEET3: https://github.com/ESIPFed/sweet
* UO + PATO: http://purl.obolibrary.org/obo/uo.owl + http://purl.obolibrary.org/obo/pato.owl
* Wikidata: https://query.wikidata.org/ (public SPARQL endpoint)

# Adding further ontologies

Further ontologies can easily be added by either providing suitable ontology files or a supporting SPARQL endpoint. Adhere to the following steps and choose in step 2 between source files and SPARQL endpoint.

1. Create the folder `/data/[Ontology]/sparql` and add a SPARQL query (in a `.rq` file) for each covered concept. The concepts and their attributes are defined in [`/analysis/config/structure.js`](../master/analysis/config/structure.js).
2. Create the folder `/data/[Ontology]/src`. Choose one of the following:

    a. Source Files: Add the ontology file(s).
    
    b. SPARQL Endpoint: Add a file `endpoint.js` that includes the required connection details. An example can be found in `data/WD/src/endpoint.js`.

The added ontology will then be automatically involved at the next execution of the evaluation scripts. 

# Precomputed Results

We provide precomputed results in two ways, which can be found using the following links:

* [Result files of the extraction of individuals](https://github.com/fusion-jena/unit-ontology-review-results/releases/download/v1.4.0/extracted_individuals.zip)
* [Result files of analysis](https://github.com/fusion-jena/unit-ontology-review-results/archive/v1.4.0.zip)

# Acknowledgments

Part of this work was funded by DFG in the scope of the LakeBase project within the Scientific Library Services and Information Systems (LIS) program.
