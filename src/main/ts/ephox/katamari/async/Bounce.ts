var bounce = function(f: Function) {
  return function(...args) {
    var me = this;
    setTimeout(function() {
      f.apply(me, args);
    }, 0);
  };
};

export default {
  bounce: bounce
};