define(
  'tinymce.themes.mobile.ios.focus.FakeSelection',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse',
    'tinymce.themes.mobile.ios.focus.ResumeEditing',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.util.Rectangles'
  ],

  function (Arr, Insert, InsertAll, Remove, DomEvent, Element, Class, Classes, Css, Traverse, ResumeEditing, Styles, Rectangles) {
    return function (win, frame) {
      // NOTE: This may be required for android also.


      /*
       * FakeSelection is used to draw rectangles around selection so that when the content loses
       * focus, the selection is still visible. The selections should match the current content
       * selection, and be removed as soon as the user clicks on them (because the content will
       * get focus again)
       */
      var doc = win.document;

      var container = Element.fromTag('div');
      Class.add(container, Styles.resolve('unfocused-selections'));

      Insert.append(Element.fromDom(doc.documentElement), container);

      var onTouch = DomEvent.bind(container, 'touchstart', function (event) {
        // We preventDefault the event incase the touch is between 2 letters creating a new collapsed selection,
        // in this very specific case we just want to turn the fake cursor into a real cursor.  Remember that
        // touchstart may be used to dimiss popups too, so don't kill it completely, just prevent its
        // default native selection
        event.prevent();
        ResumeEditing.resume(win, frame);
        clear();
      });

      var make = function (rectangle) {
        var span = Element.fromTag('span');
        Classes.add(span, [ Styles.resolve('layer-editor'), Styles.resolve('unfocused-selection') ]);
        Css.setAll(span, {
          'left': rectangle.left() + 'px',
          'top': rectangle.top() + 'px',
          'width': rectangle.width() + 'px',
          'height': rectangle.height() + 'px'
        });
        return span;
      };

      var update = function () {
        clear();
        var rectangles = Rectangles.getRectangles(win);
        var spans = Arr.map(rectangles, make);
        InsertAll.append(container, spans);
      };

      var clear = function () {
        Remove.empty(container);
      };

      var destroy = function () {
        onTouch.unbind();
        Remove.remove(container);
      };

      var isActive = function () {
        return Traverse.children(container).length > 0;
      };

      return {
        update: update,
        isActive: isActive,
        destroy: destroy,
        clear: clear
      };
    };
  }
);