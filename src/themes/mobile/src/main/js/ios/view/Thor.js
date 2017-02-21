define(
  'tinymce.themes.mobile.ios.view.Thor',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFilter'
  ],

  function (Arr, Attr, Css, SelectorFilter) {
    var attr = 'data-ephox-mobile-fullscreen-style';
    var siblingStyles = 'display:none!important;';
    var ancestorStyles = 'position:absolute!important;top:0!important;left:0!important;margin:0!important;padding:0!important;width:100%!important;';
    var bgFallback = 'background-color:rgb(255,255,255)!important;';

    var matchColor = function (editorBody) {
      // in iOS you can overscroll, sometimes when you overscroll you can reveal the bgcolor of an element beneath,
      // by matching the bg color and clobbering ensures any reveals are 'camouflaged' the same color
      var color = Css.get(editorBody, 'background-color');
      return (color !== undefined && color !== '') ? 'background-color:' + color + '!important' : bgFallback;
    };

    // We clobber all tags, direct ancestors to the editorBody get ancestorStyles, everything else gets siblingStyles
    var clobberStyles = function (container, editorBody) {
      var gatherSibilings = function (element) {
        var siblings = SelectorFilter.siblings(element, '*');
        return siblings;
      };

      var clobber = function (clobberStyle) {
        return function (element) {
          var styles = Attr.get(element, 'style');
          var backup = styles === undefined ? 'no-styles' : styles.trim();

          if(backup === clobberStyle) return;
          Attr.set(element, attr, backup);
          Attr.set(element, 'style', clobberStyle);
        };
      };

      var ancestors = [ container ].concat(SelectorFilter.ancestors(container, '*'));
      var siblings = Arr.bind(ancestors, gatherSibilings);
      var bgColor = matchColor(editorBody);

      /* NOTE: This assumes that container has no siblings itself */
      Arr.each(siblings, clobber(siblingStyles));
      Arr.each(ancestors, clobber(ancestorStyles + bgColor));
    };

    var restoreStyles = function () {
      var clobberedEls = SelectorFilter.all('['+ attr + ']');
      Arr.each(clobberedEls, function (element) {
        var restore = Attr.get(element, attr);
        if(restore !== 'no-styles') Attr.set(element, 'style', restore);
          else Attr.remove(element, 'style');
        Attr.remove(element, attr);
      });
    };

    return {
      clobberStyles: clobberStyles,
      restoreStyles: restoreStyles
    };
  }
);
