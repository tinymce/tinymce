define(
  'ephox.alloy.toolbar.Overflowing',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.toolbar.MoreOverflow',
    'ephox.alloy.toolbar.ScrollOverflow',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Css'
  ],

  function (Behaviour, DomModification, MoreOverflow, ScrollOverflow, FieldPresence, FieldSchema, ValueSchema, Fun, Css) {
    var behaviourName = 'overflowing';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.choose(
        'mode',
        {
          scroll: ScrollOverflow,
          more: MoreOverflow
        }
        /* */
      )
    );

    var exhibit = function (info, base) {     
      return info[behaviourName]().fold(function () {
        return DomModification.nu({ });
      }, function (oInfo) {
        return oInfo.handler().doExhibit(oInfo, base);
      });
    };

    var apis = function (info) {
      return info[behaviourName]().fold(function () {
        return { };
      }, function (oInfo) {
        var x = oInfo.handler().toApis(oInfo);
        console.log('x', x);
        return x;
      });
    };

    var handlers = function (info) {
      var bInfo = info[behaviourName]();
      return bInfo.fold(function () {
        return { };
      }, function (/* */) {
        return { };
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
