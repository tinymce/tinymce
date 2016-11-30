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

    var schema = Behaviour.schema(behaviourName, [
      FieldSchema.strict('invalidClass'),
      
      FieldSchema.optionObjOf('notify', [
        FieldSchema.defaulted('aria', 'alert'),
        // Maybe we should use something else.
        FieldSchema.defaulted('getContainer', Option.none),
        FieldSchema.defaulted('validHtml', ''),
        FieldSchema.defaulted('onValid', Fun.noop),
        FieldSchema.defaulted('onInvalid', Fun.noop),
        FieldSchema.defaulted('onValidate', Fun.noop)
      ]),

      FieldSchema.optionObjOf('validator', [
        FieldSchema.strict('validate'),
        FieldSchema.defaulted('onEvent', 'input')
      ])
    ]);

    var doMarkValid = function (component, invalidInfo) {
      Class.remove(component.element(), invalidInfo.invalidClass());
      invalidInfo.notify().bind(function (notifyInfo) {
        notifyInfo.getContainer()(component).each(function (container) {
          Html.set(container, notifyInfo.validHtml());
        });

        notifyInfo.onValid()(component);
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

        notifyInfo.onInvalid()(component, text);
      });
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return Behaviour.activeApis(
        behaviourName,
        info,
        {
          markInvalid: doMarkInvalid,
          markValid: doMarkValid
        }
      );
    };

    var handlers = function (info) {
      return info.invalidating().bind(function (invalidInfo) {
        return invalidInfo.validator().map(function (validatorInfo) {
          return Objects.wrap(
            validatorInfo.onEvent(),
            EventHandler.nu({
              run: function (component) {
                invalidInfo.notify().each(function (notifyInfo) {
                  notifyInfo.onValidate()(component);
                });

                validatorInfo.validate()(component).get(function (valid) {
                  valid.fold(function (err) {
                    doMarkInvalid(component, invalidInfo, err);
                  }, function () {
                    doMarkValid(component, invalidInfo);
                  });
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