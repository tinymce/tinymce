define(
  'ephox.alloy.behaviour.Overflowing',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Arr, Fun, Cell) {
    var behaviourName = 'overflowing';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.choose(
        'overflow',
        {
          scroll: [
            FieldSchema.strict('defaultWidth'),
            // Get sensible initial values.
            // FieldSchema.state('setWidth', Cell),
            FieldSchema.state('mode', function () {
              return function (info) {
                return {
                  width: info.defaultWidth
                }
              };
            })
          ]
        }
        /* */
      )
    );


// var schema = FieldSchema.field(
//       'keying',
//       'keying',
//       FieldPresence.asOption(),
//       ValueSchema.choose(
//         'mode',
//         {
//           // Note, these are only fields.
//           cyclic: CyclicType.schema(),
//           flow: FlowType.schema(),
//           flatgrid: FlatgridType.schema(),
//           matrix: MatrixType.schema(),
//           execution: ExecutionType.schema(),
//           menu: MenuType.schema(),
//           escaping: EscapingType.schema(),
//           special: SpecialType.schema()
//         }
//       )
//     );


// var itemSchema = ValueSchema.choose(
//       'type',
//       {
//         button: [
//           FieldSchema.strict('text'),
//           FieldSchema.state('builder', function () {
//             return function (info) {
//               return {
//                 uiType: 'button',
//                 dom: {
//                   classes: [ 'toolbar-group-item' ]
//                 },
//                 tabstopping: undefined,
//                 focusing: true,
//                 action: function () { },
//                 text: info.text()
//               };
//             };
//           })
//         ]
//       }
//     );


    var doRefresh = function (component, bInfo) {
      /* */
    };

    var exhibit = function (info, base) {
      return info[behaviourName]().fold(function () {
        return DomModification.nu({ });
      }, function (oInfo) {
        return DomModification.nu({
          styles: {
            'overflow-x': 'scroll',
            'max-width': oInfo.defaultWidth()
          },
          defChildren: [
            {
              uiType: 'custom',
              dom: {
                tag: 'div'
              },
              domChildren: Arr.map(info.components(), function (c) { return c.element(); })
            }
          ],
          domChildren: [ ]
        });
      });
    };

    var apis = function (info) {
      return {
        refresh: Behaviour.tryActionOpt(behaviourName, info, 'refresh', doRefresh)
      };
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
