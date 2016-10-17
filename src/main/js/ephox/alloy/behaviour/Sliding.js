define(
  'ephox.alloy.behaviour.Sliding',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.sliding.SlidingDimension',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Width'
  ],

  function (Behaviour, DomModification, SlidingDimension, FieldPresence, FieldSchema, ValueSchema, Fun, Height, Width) {
    var behaviourName = 'sliding';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.choose(
        'mode',
        {
          // Note, these are only fields.
          height: SlidingDimension(
            'height',
            function (elem) {
              return Height.get(elem) + 'px';
            }
          ),
          width: SlidingDimension(
            'width',
            function (elem) {
              return Width.get(elem) + 'px';
            }
          )
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
