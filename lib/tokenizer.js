'use strict';

module.exports = function(src) {
  var source = src;
  var tokens = [];
  var regexQueue = [];
  var patterns = [
    /^\s+/, // whitespace
    /^[^\s]+/ // word
  ];

  patterns.forEach(function(pattern) {
    regexQueue.push(function() {
      var ret = false;
      var result = pattern.exec(source);

      if (result) {
        tokens.push(result[0]);
        source = source.substring(result[0].length);
        ret = true;
      }

      return ret;
    });
  });

  while (source) {
    regexQueue.some(function(element, index, array) {
      return element();
    });
  }

  return tokens;
};
