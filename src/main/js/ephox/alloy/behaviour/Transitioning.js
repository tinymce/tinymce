define(
  'ephox.alloy.behaviour.Transitioning',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.log.AlloyLogger',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.echo.api.AriaFocus',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!Error'
  ],

  function (Behaviour, DomModification, AlloyLogger, FieldPresence, FieldSchema, ValueSchema, Arr, Obj, AriaFocus, Fun, Insert, Remove, Error) {
    var behaviourName = 'transitioning';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.strict('views'),
        FieldSchema.strict('base')
      ])
    );

    var clearOld = function (component, transitionInfo) {
      var old = component.components();
      Arr.each(old, function (child) {
        child.getSystem().removeFromWorld(child);
      });
    };

    var unsupportedView = function (component, transitionInfo, viewName) {
      var views = Obj.keys(transitionInfo.views());
      return new Error(
        'View [' + viewName + '] not supported by component: ' + AlloyLogger.element(component.element()) + '\n' +
        'Supported views: ' + views.join(', ')
      );
    };

    var revertToBase = function (component, transitionInfo) {
      doTransitionTo(component, transitionInfo, transitionInfo.base());
    };

    var doTransitionTo = function (component, transitionInfo, data) {
      clearOld(component, transitionInfo);
      // NOTE: we may want to create a behaviour which allows you to switch
      // between predefined layouts, which would make a noop detection easier.
      // Until then, we'll just use AriaFocus like redesigning does.
      AriaFocus.preserve(function () {
        var children = Arr.map(data, component.getSystem().build);
        Remove.empty(component.element());
        Arr.each(children, function (l) {
          component.getSystem().addToWorld(l);
          Insert.append(component.element(), l.element());
        });
      }, component.element());
    };

    var doTransition = function (component, transitionInfo, viewName) {
      var builder = transitionInfo.views()[viewName];
      if (builder === undefined) throw unsupportedView(component, transitionInfo, viewName);

      var data = builder(component, function () {
        revertToBase(component, transitionInfo);
      });

      doTransitionTo(component, transitionInfo, data);
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return {
        transition: Behaviour.tryActionOpt(behaviourName, info, 'transition', doTransition)
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