define(
  'ephox.alloy.behaviour.Invalidating',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.echo.api.AriaVoice',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Html'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, AriaVoice, Fun, Body, Class, Html) {
    var behaviourName = 'invalidating';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.strict('invalidClass'),
        FieldSchema.field(
          'notify',
          'notify',
          FieldPresence.asOption(),
          ValueSchema.objOf([
            FieldSchema.defaulted('aria', 'alert'),
            FieldSchema.option('container')
          ])
        )
      ])
    );

    var doMarkValid = function (component, invalidInfo) {
      Class.remove(component.element(), invalidInfo.invalidClass());
      invalidInfo.notify().bind(function (notifyInfo) {
        return notifyInfo.container();
      }).each(function (container) {
        Html.set(container, '');
      });
    };

    var doMarkInvalid = function (component, invalidInfo, text) {
      Class.add(component.element(), invalidInfo.invalidClass());
      invalidInfo.notify().each(function (notifyInfo) {
        // Probably want to make "Body" configurable as well.
        AriaVoice.shout(Body.body(), text);
        notifyInfo.container().each(function (container) {
          // TODO: Should we just use Text here, not HTML?
          Html.set(container, text);
        });
      });
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return {
        markInvalid: Behaviour.tryActionOpt(behaviourName, info, 'markInvalid', doMarkInvalid),
        markValid: Behaviour.tryActionOpt(behaviourName, info, 'markValid', doMarkValid)
      };
    };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);