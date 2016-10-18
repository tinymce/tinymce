define(
  'ephox.alloy.toolbar.MoreOverflow',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.toolbar.OverflowState',
    'ephox.alloy.toolbar.Overflows',
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse',
    'ephox.sugar.api.Width'
  ],

  function (Behaviour, DomModification, OverflowState, Overflows, ToolbarSpecs, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Fun, Option, Cell, Css, Insert, InsertAll, Remove, Traverse, Width) {
    var behaviourName = 'more-overflowing';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.strict('initGroups'),
        FieldSchema.strict('drawer'),
        FieldSchema.strict('button'),
        FieldSchema.state('state', OverflowState)
      ])
    );

    var exhibit = function () {
      return DomModification.nu({ });
    };

    var doSetGroups = function (component, oInfo, groups) {
      oInfo.state().groups().set(Option.some(groups));
    };

    var getButton = function (component, oInfo) {
      var s = oInfo.state().button();
      return s.get().fold(function () {
        var groupSpec =  ToolbarSpecs.buildGroup(
          ValueSchema.asStructOrDie('overflow.group', ToolbarSpecs.groupSchema(), {
            label: 'more-button-group',
            components: [
              {
                type: 'button',
                buttonType: oInfo.button().buttonType,
                action: function () {
                  oInfo.button().action(getDrawer(component, oInfo));
                }
              }
            ]
          })
        );

        var built = component.getSystem().build(groupSpec);
        // component.getSystem().addToWorld(built);
        s.set(Option.some(built));
        return built;
      }, Fun.identity);
    };

    var getDrawer = function (component, oInfo) {
      var s = oInfo.state().drawer();
      return s.get().fold(function () {
        var built = component.getSystem().build(oInfo.drawer());
         component.getSystem().addToWorld(built);
         s.set(Option.some(built));
        return built;
      }, Fun.identity);
    };

    var doRefresh = function (component, oInfo) {
      // NOTE: Assumes syncComponents has been called.
      var components = component.components();
      var toolbar = components[0];

      
      
      Css.set(toolbar.element(), 'visibility', 'hidden');

      var groups = oInfo.state().groups().get().getOr(oInfo.initGroups());

      // Clear any restricted width on the toolbar somehow ----- */
      // barType.clearWidth()

      toolbar.apis().replace(groups);
      toolbar.syncComponents();


       
      var button = getButton(component, oInfo);
      var drawer = getDrawer(component, oInfo);
      // component.getSystem().removeFromWorld(button);
      // component.getSystem().removeFromWorld(drawer);


 // NOTE: We need to add the overflow button because it has no width otherwise
        // Note, adding it doesn't affect the width of the toolbar, so it should be fine.
        // var overflows = oInfo.overflows();
        // Insert.append(toolbar, overflows);

      Insert.append(toolbar.element(), button.element());
      var total = Width.get(toolbar.element());
     

      var overflows = Overflows.partition(total, toolbar.components(), function (comp) {
        var w = Width.get(comp.element());
        return w;
      }, button);

      Remove.remove(button.element());
      


      if (overflows.extra().length === 0) {
        drawer.apis().replace([ ]);
        Remove.remove(drawer.element());
      } else {
        toolbar.apis().replace(Arr.map(overflows.within(), function (c) {
          return { built: c };
        }));

        drawer.apis().replace(Arr.map(overflows.extra(), function (c) {
          return { built: c };
        }));

        Insert.append(component.element(), drawer.element());
      }

      
      component.syncComponents();
      drawer.syncComponents();
      toolbar.syncComponents();



      // Add the within to the toolbar, and the extra to the more drawer

      // barType.updateWidth

      Css.remove(toolbar.element(), 'visibility');
      // Add the overflow group
    };

    var apis = function (info) {
      return {
        refresh: Behaviour.tryActionOpt(behaviourName, info, 'refresh', doRefresh),
        setGroups: Behaviour.tryActionOpt(behaviourName, info, 'setGroups', doSetGroups)
      };
    };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: apis,
      schema: Fun.constant(schema)
    });

        // var toApis = function (oInfo) {
        //   return {
        //     refresh: function (comp) {
        //       doRefresh(comp, oInfo);
        //     }
        //   };
            
        // // var groups = getGroups();
        // // var components = barType.build(groups);

        // // // Remove all components from the toolbar
        // // Css.set(toolbar, 'visibility', 'hidden');
        // // // Clear any previous width setting so that it calculates the non-restricted width of the toolbar
        // // barType.clearWidth();

        // // Remove.empty(toolbar);
        // // InsertAll.append(toolbar, components);

        // // var total = barType.width(toolbar);

        // // // NOTE: We need to add the overflow button because it has no width otherwise
        // // // Note, adding it doesn't affect the width of the toolbar, so it should be fine.
        // // Insert.append(toolbar, overflow.group());

        // // var divide = Overflow.partition(total, components, Width.getOuter, overflow.group());
        // // var extra = divide.extra();
        // // var within = divide.within();

        // // Remove.empty(toolbar);
        // // Remove.empty(mores);

        // // InsertAll.append(toolbar, within);
        // // InsertAll.append(mores, extra);

        // // barType.updateWidth(overflow, divide);
        // // Css.remove(toolbar, 'visibility');
        // };

        // var postprocess = function (oInfo, components) {
        //   debugger;
        //   groups.set(components[0].components());
        // };

      //   return {
      //     doExhibit: doExhibit,
      //     toApis: toApis,
      //     builder: builder,
      //     schema: Fun.constant(schema),
      //     postprocess: postprocess
      //   };
      // })
  }
);