define(
  'ephox.alloy.behaviour.Dragging',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.dragging.MouseDragging',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomModification, MouseDragging, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var behaviourName = 'dragging';

    var schema = Behaviour.modeSchema(behaviourName, 'mode', {
      'mouse': MouseDragging
    });   

    var exhibit = function (info, base) {
      return info[behaviourName]().fold(function () {
        return DomModification.nu({ });
      }, function (/* */) {
        return DomModification.nu({ });
      });
    };

    var apis = function (info) {
      return { };
    };

    var handlers = function (info) {
      return info[behaviourName]().fold(function () {
        return { };
      }, function (dragInfo) {
        var dragger = dragInfo.dragger();
        return dragger.handlers(dragInfo);
      });
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