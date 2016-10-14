define(
  'ephox.alloy.behaviour.Behaviour',

  [
    'ephox.alloy.log.AlloyLogger',
    'ephox.scullion.Contracts',
    'global!Array',
    'global!console'
  ],

  function (AlloyLogger, Contracts, Array, console) {
    var contract = Contracts.exactly([ 'name', 'exhibit', 'handlers', 'apis', 'schema' ]);

    var truncate = function (element) {
      return AlloyLogger.element(element);
    };

    var tryActionOpt = function (field, info, apiName, f) {
      return function (component/*, */) {
        var args = Array.prototype.slice.call(arguments, 0);
        var delegate = component.delegate().map(function (dlg) { return dlg.get()(); });
        return delegate.fold(function () {
          var behaviourInfo = info[field]();
          return behaviourInfo.fold(function () {
            console.error('Ui (' + truncate(component.element()) + ') does not support: ' + apiName);
            console.error('component', component);
            return false;
          }, function (bInfo) {
            return f.apply(undefined, [ component, bInfo ].concat(args.slice(1)));
          });
        }, function (dlg) {
          return dlg.apis()[apiName].apply(undefined, args.slice(1));
        });
      };
    };

    return {
      tryActionOpt: tryActionOpt,
      contract: contract
    };
  }
);