define(
  'ephox.alloy.behaviour.Focusing',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Focus'
  ],

  function (SystemEvents, Behaviour, EventHandler, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Fun, Focus) {
    var schema = FieldSchema.field(
      'focusing',
      'focusing',
      FieldPresence.asDefaultedOption({
        onFocus: Fun.noop
      }),
      ValueSchema.objOf([
        // TODO: Work out when we want to  call this. Only when it is has changed?
        FieldSchema.defaulted('onFocus', Fun.noop)
      ])
    );

    var doFocus = function (component, focusInfo) {
      Focus.focus(component.element());
      focusInfo.onFocus()(component);

    };

    var doBlur = function (component) {
      Focus.blur(component.element());
    };

    var doIsFocused = function (component) {
      return Focus.hasFocus(component.element());
    };

    var exhibit = function (info, base) {
      if (info.focusing().isNone()) return DomModification.nu({});
      return DomModification.nu({
        attributes: {
          'tabindex': '-1'
        }
      });
    };

    var apis = function (info) {
      return {
        focus: Behaviour.tryActionOpt('focusing', info, 'focus', doFocus),
        blur: Behaviour.tryActionOpt('focusing', info, 'blur', doBlur),
        // Should be supported either way.
        isFocused: doIsFocused
      };
    };

    var handlers = function (info) {
      var focusing = info.focusing();
      return focusing.fold(function () {
        return { };
      }, function (focusInfo) {
        return Objects.wrap(
          SystemEvents.focus(),
          EventHandler.nu({
            run: function (component, simulatedEvent) {
              doFocus(component, focusInfo);
            }
          })
        );
      });
    };

    return Behaviour.contract({
      name: Fun.constant('focusing'),
      exhibit: exhibit,
      handlers: handlers,
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);