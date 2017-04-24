define(
  'ephox.alloy.api.behaviour.Delegating',

  [
    'ephox.alloy.alien.DomState',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.BehaviourState',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Options',
    'ephox.katamari.api.Result'
  ],

  function (DomState, Behaviour, BehaviourState, Tagger, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Cell, Fun, Options, Result) {
    var delegateState = (function () {
      var init = function () {

        var readState = Fun.constant('delegating-state-not-supported');

        var getOrInit = function (stateInit, target) {
          return DomState.getOrCreate(target.element(), function () {
            return stateInit.init(/* arguments */);
          });
        };

        return BehaviourState({
          getOrInit: getOrInit,
          init: init,
          readState: readState
        });
      };

      return {
        init: init
      };
    })();
    
    var fields = [
      FieldSchema.field('dispatchers', 'dispatchers', FieldPresence.strict(), ValueSchema.arrOfObj([
        FieldSchema.strict('getTarget'),
        FieldSchema.field('behaviours', 'behaviours', FieldPresence.defaulted([ ]), ValueSchema.valueOf(function (v) {
          // this is an array of { behaviour: ..., config: ... }
          var xx = Arr.map(v, function (vv) {
            return {
              behaviour: vv.behaviour,
              reference:vv.behaviour.config(vv.config).value
            };
          })
          console.log('xx', xx);
          return Result.value(
            xx
          );
        }))
      ]))
    ];

    var findDispatcher = function (component, dConfig, dState, empoweree) {
      return Options.findMap(dConfig.dispatchers(), function (d) {
        return d.getTarget()(empoweree).map(function (tgt) {
          return {
            behaviours: d.behaviours,
            target: tgt
          };
        });
      });
    };

    var name = 'delegating';
    var active = {
      events: function (behaviourInfo) {
        var allEvents = { };
        Arr.each(behaviourInfo.dispatchers(), function (disp) {
          var bs = disp.behaviours();
          Arr.each(bs, function (b) {
            console.log('behaviourInfo', behaviourInfo);
            var evs = b.behaviour.handlers(behaviourInfo /*state*/);
            console.log('evs', b.behaviour.name(), evs);
          });
        });
        return allEvents;
      }
    };
    var apis = {
      delegateApi: function (component, dConfig, dState, empoweree, b) {
        return findDispatcher(component, dConfig, dState, empoweree).bind(function (disp) {
          console.log('disp', disp);
          return Arr.find(disp.behaviours(), function (bb) {
            console.log('checking ',bb.behaviour, b);
            return bb.behaviour === b; // or check name
          }).map(function (bb) {
            console.log('bb', bb);
            return bb.reference;
          }).map(function (bData) {
            console.log('bData', bData);
            var config = bData.config;
            var state = dState.getOrInit(bData.state, disp.target);

            return b.delegation(disp.target, config, state);
          });
        }).fold(function () {
          return Result.error('could not find delegation information for '  +b.name());
        }, Result.value);
      }
    };
    var extra = { };
    return Behaviour.create(fields, name, active, apis, extra, delegateState);

  }
);
