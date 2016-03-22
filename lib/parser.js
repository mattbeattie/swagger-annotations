'use strict';

var StringScanner = require('StringScanner');
var tokenize = require('./tokenizer');

var FUNCTION_NAME = /function\s+(\w+)\s*\(/;
var FUNCTION_NAME_REF = /,\s*(.*)\s*\)/;
var GRAMMAR = [
  'swaggerTag',
  'swaggerParameter',
  'swaggerPath',
  'swaggerResponse',
  'swaggerDefinition'
];

function parser(comment) {
  var ss = new StringScanner(comment);

  var parsedComment = {};

  while (!ss.eos()) {
    var annotation = null;
    var parameters = null;

    // check if there are anymore annotations to find
    if (ss.scanUntil(/@/) === null) {
      break;
    }

    // check if this is an annotation with parameters
    var annotationCheck = ss.checkUntil(/\(/);

    // went to a next line, so it doesn't have parameters
    if (annotationCheck === null || annotationCheck.match(/\n/)) {

      annotation = ss.scanUntil(/\n/);
      annotation = annotation.trim('\n');

    // has parameters
    } else {
      annotation = ss.scanUntil(/\(/);
      annotation = annotation.substring(0, annotation.length - 1);

      var done = false;

      parameters = '';

      while (!done) {
        var scan = ss.scanUntil(/\)/g);

        if (scan === null) {
          done = true;
        } else {
          parameters = parameters + scan;

          var open;
          if (!parameters.match(/\(/)) {
            open = 1;
          } else {
            open = parameters.match(/\(/g).length + 1;
          }

          var close;
          if (!parameters.match(/\)/)) {
            close = 0;
          } else {
            close = parameters.match(/\)/g).length;
          }

          if (open === close) {
            done = true;
          }
        }
      }

      parameters = parameters.substring(0, parameters.length - 1);
    }

    if (GRAMMAR.indexOf(annotation) >= 0) {
      parsedComment.type = annotation;

      var tokens = tokenize(parameters);
      var fixedString = '';

      // clean up comment asterisks and line breaks
      tokens.forEach(function(token) {
        if (token.trim('') !== '*') {
          fixedString += token.replace('\n', '');
        }
      });

      parsedComment.data = new Function('return [' + fixedString + '];')();
    }
  }

  return parsedComment;
}

module.exports = function(source) {
  var annotations = [];
  var ss = new StringScanner(source);

  while (!ss.eos()) {
    var tmpAnnotation = {};
    var cs = ss.scanUntil(/\/\*\*/);
    if (cs == null) break;
    var csp = ss.pointer() - 3;
    ss.scanUntil(/\*\/\n/);
    var cep = ss.pointer();
    var comment = source.substring(csp, cep);

    if (comment) {
      tmpAnnotation = parser(comment);
    }

    // Grab the handler ID from the proceeding router definition
    if (tmpAnnotation.type === 'swaggerPath') {
      var rs = ss.scanUntil(/.[\w+]\(/);
      var rsp = ss.pointer() - rs.length;
      ss.scanUntil(/\);/);
      var rep = ss.pointer();
      var routerDef = source.substring(rsp, rep);
      var match;
      // Check if a function() was used for the handler
      if ((match = routerDef.match(FUNCTION_NAME))) {
        tmpAnnotation.operationId = match[1];
      }
      // Check if a function reference was used for the handler
      else if ((match = routerDef.match(FUNCTION_NAME_REF))) {
        tmpAnnotation.operationId = match[1].split('.').pop();
      }
    }

    annotations.push(tmpAnnotation);
  }

  return annotations;
};
