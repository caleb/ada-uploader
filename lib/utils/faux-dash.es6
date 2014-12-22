let counter = 0;

module.exports = {
  uniqueId: function(prefix = "") {
    return prefix + (counter++);
  }
};
