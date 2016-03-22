'use strict';

var path = require('path');
var resolve = require('resolve');
var parser = require('./lib/parser');
var swaggotate = require('./lib');
var helpers = require('./lib/helpers');

module.exports = function(opts) {
  // Get file path of module.
  var filePath = resolve.sync(path.join(process.cwd(), opts.src));

  // Read in our file source.
  var fileSource = helpers.readFileSync(filePath);

  // Get all annotations from our input file.
  var annotations = parser(fileSource);

  /*
   * Get our formatted swagger data by passing the
   * annotations and the required router module.
   */
  var swaggerData = swaggotate(annotations, require(filePath));

  // Merge any incoming metadata into our base data.
  Object.assign(swaggerData, opts.metadata || {});

  // Write our JSON to disk (if a destination is specified).
  if (opts.dest) {
    helpers.writeFileSync(opts.dest, opts.filename || 'swagger.json', swaggerData);
  }

  // Return formatted data.
  return swaggerData;
};
