var bounce = function(f) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var me = this;
    setTimeout(function() {
      f.apply(me, args);
    }, 0);
  };
};

export default <any> {
  bounce: bounce
};