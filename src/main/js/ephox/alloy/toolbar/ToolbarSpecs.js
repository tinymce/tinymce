define(
  'ephox.alloy.toolbar.ToolbarSpecs',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (FieldPresence, FieldSchema, ValueSchema, Arr, Fun) {
    var itemSchema = ValueSchema.choose(
      'type',
      {
        button: [
          FieldSchema.strict('buttonType'),
          FieldSchema.strict('action'),
          FieldSchema.state('builder', function () {
            return function (info) {
              return {
                uiType: 'button',
                buttonType: info.buttonType(),
                // dom: {
                //   classes: [ 'toolbar-group-item' ],
                //   styles: {
                //     display: 'flex'
                //   }
                // },
                tabstopping: undefined,
                focusing: true,
                action: info.action()
              };
            };
          })
        ]
      }
    );


    // TODO: Standardise all of these.
    var groupSchema = ValueSchema.objOf([
      FieldSchema.option('label'),
      FieldSchema.field(
        'components',
        'components',
        FieldPresence.strict(),
        ValueSchema.arrOf(itemSchema)
      )
    ]);

    var toolbarSchema = ValueSchema.objOf([
      FieldSchema.option('label'),
      FieldSchema.field(
        'groups',
        'groups',
        FieldPresence.strict(),
        ValueSchema.arrOf(
          groupSchema
        )
      )
    ]);

    var buildItem = function (compInfo) {
      return compInfo.builder()(compInfo);
    };

    var buildGroup = function (group) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'div',
          styles: {
            display: 'flex'
          }
        },
        keying: {
          mode: 'flow',
          selector: '.toolbar-group-item'
        },
        tabstopping: true,
        // GOTCHAs. False won't do anything. Fix this so we don't have to pass "undefined"
        focusing: undefined,
        components: Arr.map(group.components(), buildItem)
      };
    };

    return {
      buildGroup: buildGroup,
      buildItem: buildItem,
      groupSchema: Fun.constant(groupSchema),
      toolbarSchema: Fun.constant(toolbarSchema)
    };
  }
);