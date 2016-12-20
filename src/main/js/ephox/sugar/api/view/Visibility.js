define(
  'ephox.sugar.api.view.Visibility',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Toggler',
    'ephox.sugar.api.properties.Css'
  ],

  function (Fun, Toggler, Css) {
    // This function is dangerous. Toggle behaviour is different depending on whether the element is in the DOM or not when it's created.
    var visibilityToggler = function (element, property, hiddenValue, visibleValue) {
      var initial = Css.get(element, property);
      // old jquery-ism that this function depends on
      if (initial === undefined) initial = '';

      var value = initial === hiddenValue ? visibleValue : hiddenValue;

      var off = Fun.curry(Css.set, element, property, initial);
      var on = Fun.curry(Css.set, element, property, value);
      return Toggler(off, on, false);
    };

    var toggler = function (element) {
      return visibilityToggler(element, 'visibility', 'hidden', 'visible');
    };

    var displayToggler = function (element, value) {
      return visibilityToggler(element, 'display', 'none', value);
    };

    var isHidden = function (dom) {
      return dom.offsetWidth <= 0 && dom.offsetHeight <= 0;
    };

    var isVisible = function (element) {
      var dom = element.dom();
      return !isHidden(dom);
    };

    return {
      toggler: toggler,
      displayToggler: displayToggler,
      isVisible: isVisible
    };
  }
);
