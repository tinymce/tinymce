define(
  'ephox.alloy.behaviour.Sliding',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.sliding.SlidingHeight',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomModification, SlidingHeight, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var behaviourName = 'sliding';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.choose(
        'mode',
        {
          // Note, these are only fields.
          height: SlidingHeight
        }
      )
    );

    var exhibit = function (info, base) {
      return info[behaviourName]().fold(function () {
        return DomModification.nu({ });
      }, function (sInfo) {
        return sInfo.handler().doExhibit(sInfo, base);
      });
    };

    var apis = function (info) {
      return info[behaviourName]().fold(function () {
        return { };
      }, function (oInfo) {
        return oInfo.handler().toApis(oInfo);
      });
    };

    var handlers = function (info) {
      var bInfo = info[behaviourName]();
      return bInfo.fold(function () {
        return { };
      }, function (sInfo) {
        return sInfo.handler().toEvents(sInfo);
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
