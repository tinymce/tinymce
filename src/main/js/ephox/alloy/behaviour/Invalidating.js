define(
  'ephox.alloy.behaviour.Invalidating',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.echo.api.AriaVoice',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Html'
  ],

  function (Behaviour, EventHandler, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, AriaVoice, Fun, Option, Body, Class, Html) {
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
            // Maybe we should use something else.
            FieldSchema.defaulted('getContainer', Option.none)
          ])
        ),

        FieldSchema.field(
          'validator',
          'validator',
          FieldPresence.asOption(),
          ValueSchema.objOf([
            FieldSchema.strict('validate'),
            FieldSchema.defaulted('onEvent', 'input')
          ])
        )
      ])
    );

    var doMarkValid = function (component, invalidInfo) {
      Class.remove(component.element(), invalidInfo.invalidClass());
      invalidInfo.notify().bind(function (notifyInfo) {
        return notifyInfo.getContainer()(component);
      }).each(function (container) {
        Html.set(container, '');
      });
    };

    var doMarkInvalid = function (component, invalidInfo, text) {
      Class.add(component.element(), invalidInfo.invalidClass());
      invalidInfo.notify().each(function (notifyInfo) {
        // Probably want to make "Body" configurable as well.
        AriaVoice.shout(Body.body(), text);
        notifyInfo.getContainer()(component).each(function (container) {
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

    var handlers = function (info) {
      return info.invalidating().bind(function (invalidInfo) {
        return invalidInfo.validator().map(function (validatorInfo) {
          return Objects.wrap(
            validatorInfo.onEvent(),
            EventHandler.nu({
              run: function (component) {
                var valid = validatorInfo.validate()(component);
                valid.fold(function (err) {
                  doMarkInvalid(component, invalidInfo, err);
                }, function () {
                  doMarkValid(component, invalidInfo);
                });
              }
            })
          );
        });
      }).getOr({ });
    };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: handlers,
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);