define(
  'tinymce.themes.mobile.touch.view.TapToEditMask',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (Arr, Fun, Insert, Remove, DomEvent, Element, Attr, Class, Css, Styles) {
    return function (onTap) {
      var element = Element.fromTag('div'); // tap-to-edit button
      Class.add(element, Styles.resolve('disabled-mask'));

      var hasScrolled = false;

      var container = Element.fromTag('div');
      Attr.set(container, 'role', 'presentation');
      Class.add(container, Styles.resolve('content-container'));

      var tapIcon = Element.fromTag('div');
      Attr.set(tapIcon, 'role', 'presentation');
      Attr.set(tapIcon, 'aria-hidden', 'true');
      Class.add(tapIcon, Styles.resolve('mask-tap-icon'));
      

      var disclosure = Element.fromTag('div');
      Attr.set(disclosure, 'role', 'presentation');
      Class.add(disclosure, Styles.resolve('disclosure'));
      // FIX: I18n
      Insert.append(disclosure, Element.fromText('Tap to edit'));
      Insert.append(container, disclosure);
      Insert.append(container, tapIcon);
      Insert.append(element, container);

      Attr.set(element, 'role', 'button');


      // Checks that all touches occur within the constraints of the mask
      var touchesInBounds = function (touches) {
        var containerBounds = element.dom().getClientRects()[0];

        return Arr.forall(touches, function (touch) {
          return touch.pageY >= containerBounds.top &&
                 touch.pageY <= (containerBounds.top + containerBounds.height) &&
                 touch.pageX >= containerBounds.left &&
                 touch.pageX <= (containerBounds.left + containerBounds.width);
        });
      };

      var binders = [
        DomEvent.bind(element, 'touchmove', function (/* event */) {
          hasScrolled = true;
        }),
        DomEvent.bind(element, 'touchend', function (event) {
          var touches = event.raw().changedTouches;
          if (touchesInBounds(touches) && !hasScrolled) {
            fullscreen(event);
          }
        }),
        DomEvent.bind(element, 'touchstart', function (/* event */) {
          hasScrolled = false;
        }),
        DomEvent.bind(element, 'click', function (event) {
          fullscreen(event);
        })
      ];

      var fullscreen = function (event) {
        // prevent clicks from falling through to the editor & triggering the editor
        event.kill();
        onTap();
      };

      var show = function () {
        Css.remove(element, 'display');
      };

      var hide = function () {
        Css.set(element, 'display', 'none');
      };

      var destroy = function () {
        Arr.each(binders, function (binder) {
          binder.unbind();
        });
        Remove.remove(tapIcon);
        Remove.remove(disclosure);
        Remove.remove(container);
        Remove.remove(element);
      };

      return {
        element: Fun.constant(element),
        destroy: destroy,
        show: show,
        hide: hide
      };
    };
  }
);
