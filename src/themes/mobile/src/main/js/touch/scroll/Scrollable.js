define(
  'tinymce.themes.mobile.touch.scroll.Scrollable',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Class',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Fun, Class, Styles) {
    var scrollable = Styles.resolve('scrollable');

    var register = function (element) {
    /*
     *  The reason this function exists is to have a
     *  central place where to set if an element can be explicitly
     *  scrolled. This is for mobile devices atm.
     */
      Class.add(element, scrollable);
    };

    var deregister = function (element) {
      Class.remove(element, scrollable);
    };

    return {
      register: register,
      deregister: deregister,
      scrollable: Fun.constant(scrollable)
    };
  }
);
