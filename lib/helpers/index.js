'use strict';

var path = require('path');
var fs = require('fs');
var cwd = process.cwd();

/**
 * @function extractRoutes
 * @param router {object} An Express Router object
 * @returns {array} An array of route objects with the format
 *                  {method: [String], path: [String], handler: [Function]}
 */
module.exports.extractRoutes = function extractRoutes(router) {
  var _arr = [];

  // Iterate over stack of route layers
  router.stack.forEach(function(layer) {
    /**
     * Check if this layer has a route (needed for
     * possibility this could be use() layer)
     */
    if (layer.route && layer.route.stack && Array.isArray(layer.route.stack)) {
      // Grab the last sublayer from our substack
      var sublayer = layer.route.stack[layer.route.stack.length - 1];
      _arr.push({
        method: sublayer.method,
        path: layer.route.path,
        handler: sublayer.handle
      });
    }
  });

  return _arr;
};

/**
 * @function readFileSync
 * @param path {string} The filepath to read
 * @returns {object} Returns `undefined`
 */
module.exports.readFileSync = function readFileSync(path) {
  var stat = fs.lstatSync(path);
  if (!stat || !stat.isFile()) {
    return null;
  }
  return fs.readFileSync(path).toString();
};

/**
 * @function writeFileSync
 * @param dest {string} The destination directory to write the file to
 * @param filename {string} The filename for the file to be written
 * @param data {object} Object literal of data to be JSON stringified
 * @returns {object} Returns `undefined`
 */
module.exports.writeFileSync = function writeFileSync(dest, filename, data) {
  var dir = path.join(cwd, dest);
  try {
    fs.statSync(dir);
  } catch (e) {
    fs.mkdirSync(dir);
  }
  var outputFilePath = path.join(dir, filename);
  return fs.writeFileSync(outputFilePath, JSON.stringify(data));
};
