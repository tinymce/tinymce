define(
  'ephox.alloy.spec.ToolbarSpec',

  [
    'ephox.alloy.toolbar.Overflowing',
    'ephox.alloy.toolbar.ScrollOverflow',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger'
  ],

  function (Overflowing, ScrollOverflow, FieldPresence, FieldSchema, ValueSchema, Arr, Merger) {
    var itemSchema = ValueSchema.choose(
      'type',
      {
        button: [
          FieldSchema.strict('text'),
          FieldSchema.state('builder', function () {
            return function (info) {
              return {
                uiType: 'button',
                dom: {
                  classes: [ 'toolbar-group-item' ],
                  styles: {
                    display: 'flex'
                  }
                },
                tabstopping: undefined,
                focusing: true,
                action: function () { },
                text: info.text()
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

    var buildComponent = function (compInfo) {
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
        components: Arr.map(group.components(), buildComponent)
      };
    };

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('toolbar.spec', toolbarSchema, spec);

      var groups = Arr.map(detail.groups(), buildGroup);
      // Maybe default some arguments here
      return Merger.deepMerge(spec, {
        dom: {
          tag: 'div',
          styles: {
            display: 'flex'
          }
        },
        keying: {
          mode: 'cyclic'
        },
        components: groups,
        behaviours: [
          Overflowing
        ]
      }, spec, {
        uiType: 'custom'
      });
    };

    return {
      make: make
    };
  }
);