The included scripts enable an evaluation of ontologies in the field of measurement units.
They implement the approach described in a paper currently under review.
For an general overview please refer to the Structure of files.

# Dependencies and Setup

For execution at NodeJS in at least version 5 is required.
JavaScript dependencies are listed in the packages.json file and can be installed using 
`npm install`


If individuals should be extracted or new ontologies are to be added, an installtion of Sesame with at least one accessible repository of type `Nativ Java Store RDF Schema` is needed.
The store to be used, has to be configured in `/analysis/config/config.js`
Alternativly, one can use the already extracted set of individuals listed under Precomputed Results.
The provided files and folders should then be placed in a subfolder /res


# Running

To actually run the scripts, there are a few different options:

1. Each file can be run individually. Note, that in this case the results of all dependencies have to be present in the /res folder.
2. `0000 runAllScripts.js` will run all the scripts in their required order. As this included the extraction of individuals, please make sure a Sesame store is available and configured in `/analysis/config/config.default.js `
3. If a certain number of scripts at the start should be skipped, please use `0010 runFromScript.js` and as a parameter add the (number of the) first script to run.
To skip just the extraction of indivuals, please use
`node 0010 runFromScript.js 1000`
4. If only a specific sequence of scripts should be run, use `0020 runScripts.js` and add as parameters the numbers for all scripts to be run. Note, that this will not check for any dependencies, so managing them is up to the user. An example refreshing the mapping units and their output to HTML might look like
`node 0020 runScripts.js 4100 9100 9101`

# File and Folder Structure

Files are generally placed under the following subfolders:

* `/analysis` Actual analysis scripts
* `/analysis/config` Configuration files
* `/data` Input data for the scripts to use. This includes the manual mapping files given as CSV.
* `/data/[Ontology]`  Input data for a specific ontology
* `/data/[Ontology]/src`  OWL definition files for the respective ontology
* `/data/[Ontology]/sparql` SPARQL queries for extraction of individuals. Each in a seperate file named after the respective concept or relation.
* `/data/[Ontology]/js` Some ontologies needed specific treatment, which is encoded in JS, that are used as hooks. Currently there is just one hook available "unit_beforeAddLabel", which is applied, before attaching a label to any object (refer to the example given in `/data/MUO/js`).
* `/res`  Output folder for all intermediate and result files.
* `/templates`  HTML templates used for output generation

The numbering of scripts roughly follows the approach given in the paper, but also adds some implementation specific sections.
Furthermore, the number signales the execution order of scripts.
For depenedencies of the scripts please run `0100 listFiles.js` and refer to the respective output.

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

For reasons of licencing we can only provide the SPARQL queries used to extract the individuals, but not the ontology files themselves. Please refer to the respective ontologies to obtain the required files:

* MUO: http://idi.fundacionctic.org/muo/
* OBOE: https://semtools.ecoinformatics.org/oboe
* OM: http://www.wurvoc.org/vocabularies/om-1.8/
* QU: https://www.w3.org/2005/Incubator/ssn/ssnx/qu/
* QUDT: http://www.qudt.org/
* SWEET: http://sweet.jpl.nasa.gov/
* UO + PATO: http://purl.obolibrary.org/obo/uo.owl + http://purl.obolibrary.org/obo/pato.owl

# Precomputed Results

We provide precomputed results in two ways, which can be found using the following links:

* Result files of individual extraction
* Result files of analysis

# Citation

*Will be added after peer review.*
