define(
  'ephox.agar.api.RealMouse',

  [
    'ephox.agar.server.SeleniumAction'
  ],

  function (SeleniumAction) {
    var sActionOn = function (selector, type) {
      return SeleniumAction.sPerform('/mouse', {
        selector: selector,
        type: type
      });
    };
    
    var sMoveToOn = function (selector) {
      return sActionOn(selector, 'move');
    };

    var sDownOn = function (selector) {
      return sActionOn(selector, 'down');
    };

    var sUpOn = function (selector) {
      return sActionOn(selector, 'up');
    };

    var sClickOn = function (selector) {
      return sActionOn(selector, 'click');
    };

    return {
      sMoveToOn: sMoveToOn,
      sDownOn: sDownOn,
      sUpOn: sUpOn,
      sClickOn: sClickOn
    };
  }
);