define(
  'tinymce.themes.mobile.touch.view.MetaViewport',

  [
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Insert, Element, Attr, SelectorFind) {
    /*
     * The purpose of this fix is to toggle the presence of a meta tag which disables scrolling
     * for the user
     */
    var tag = function () {
      var head = SelectorFind.first('head').getOrDie();

      var nu = function () {
        var meta = Element.fromTag('meta');
        Attr.set(meta, 'name', 'viewport');
        Insert.append(head, meta);
        return meta;
      };

      var element = SelectorFind.first('meta[name="viewport"]').getOrThunk(nu);
      var backup = Attr.get(element, 'content');

      var maximize = function () {
        Attr.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
      };

      var restore = function () {
        if (backup !== undefined && backup !== null && backup.length > 0) {
          Attr.set(element, 'content', backup);
        } else {
          // According to apple docs the default is:
          //  width=980
          //  height=<calculated>
          //  initial-scale=<calculated>
          //  minimum-scale=0.25
          //  maximum-scale=5.0
          //  user-scalable yes
          // However just setting user-scalable seems to fix pinch zoom and who knows these defaults might change
          Attr.set(element, 'content', 'user-scalable=yes');
        }
      };

      return {
        maximize: maximize,
        restore: restore
      };
    };

    return {
      tag: tag
    };
  }
);