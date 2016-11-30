define(
  'ephox.alloy.behaviour.Behaviour',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.log.AlloyLogger',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Obj',
    'ephox.epithet.Id',
    'ephox.peanut.Fun',
    'ephox.scullion.Contracts',
    'global!Array',
    'global!console'
  ],

  function (DomModification, AlloyLogger, FieldSchema, Objects, ValueSchema, Obj, Id, Fun, Contracts, Array, console) {
    var contract = Contracts.exactly([ 'name', 'exhibit', 'handlers', 'apis', 'schema' ]);

    var truncate = function (element) {
      return AlloyLogger.element(element);
    };

    var tryActionOpt = function (field, info, apiName, f) {
      return function (component/*, */) {
        var args = Array.prototype.slice.call(arguments, 0);
        var delegate = component.delegate(component).map(function (dlg) { return dlg.get()(); });
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

    var exhibition = function (optName, modification) {
      var name = optName.getOr(Id.generate());
      return contract({
        name: Fun.constant(name),
        exhibit: function () {
          return DomModification.nu(modification);
        },
        apis: Fun.constant({ }),
        handlers: Fun.constant({ }),
        // Make this better.
        schema: Fun.constant(
          FieldSchema.state(name, function () { })
        )
      });
    };

    var activeApis = function (behaviourName, info, apiCalls) {
      // return Objects.wrap(
      //   behaviourName,
        return info[behaviourName]().map(function (behaviourInfo) {
          return Obj.map(apiCalls, function (f, apiName) {
            return function (component/*, */) {
              var args = Array.prototype.slice.call(arguments, 0);
              return f.apply(undefined, [ component, behaviourInfo ].concat(args.slice(1)));
            };
          });
        }).getOr({ });
      // );
    };

    var schema = function (name, fields) {
      return FieldSchema.optionObjOf(name, fields);
    };

    var modeSchema = function (name, branchKey, branches) {
     return  FieldSchema.optionOf(name, ValueSchema.choose(branchKey, branches));
    };

    return {
      tryActionOpt: tryActionOpt,
      exhibition: exhibition,
      contract: contract,
      activeApis: activeApis,
      schema: schema,
      modeSchema: modeSchema
    };
  }
);