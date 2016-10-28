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
        FieldSchema.strict('drawerUid'),
        FieldSchema.strict('primaryUid'),
        FieldSchema.strict('overflowGroup'),
        FieldSchema.state('state', OverflowState)
      ])
    );

    var exhibit = function () {
      return DomModification.nu({ });
    };

    var doSetGroups = function (component, oInfo, groups) {
      var built = Arr.map(groups, function (g) {
        return {
          built: component.getSystem().build(g)
        };
      });
      oInfo.state().groups().set(Option.some(built));
    };

    var getButton = function (component, oInfo) {
      var s = oInfo.state().button();
      return s.get().fold(function () {       
        var built = component.getSystem().build(oInfo.overflowGroup());
        // component.getSystem().addToWorld(built);
        s.set(Option.some(built));
        return built;
      }, Fun.identity);
    };

    var getPrimary = function (component, oInfo) {
      return component.getSystem().getByUid(
        oInfo.primaryUid()
      ).getOrDie();
    };

    var getDrawer = function (component, oInfo) {
      return component.getSystem().getByUid(
        oInfo.drawerUid()
      ).getOrDie();
    };

    var prebuild = function (c) {
      return { built: c };
    };

    var getGroups = function (component, oInfo) {
      return oInfo.state().groups().get().fold(function () {
        var init = oInfo.initGroups();
        doSetGroups(component, oInfo, init);
        return oInfo.state().groups().get().getOr([ ]);
      }, Fun.identity);
    };

    var doRefresh = function (component, oInfo) {
      Css.reflow(component.element());
      var groups = getGroups(component, oInfo).map(function (c) {
        return c.built;
      });

      // NOTE: Assumes syncComponents has been called.
      var primary = getPrimary(component, oInfo);
      
      
      Css.set(primary.element(), 'visibility', 'hidden');

      // Clear any restricted width on the toolbar somehow ----- */
      // barType.clearWidth()
      var drawer = getDrawer(component, oInfo);
      var overflow = getButton(component, oInfo);

      drawer.apis().setGroups([ ]);
      // NOTE: We need to add the overflow button because it has no width otherwise
      // Note, adding it doesn't affect the width of the toolbar, so it should be fine.
      primary.apis().setGroups(
        Arr.map(groups, prebuild)
      );//.concat(overflow));

      var total = Width.get(primary.element());

      var overflows = Overflows.partition(total, groups, function (comp) {
        return Width.get(comp.element());
      }, overflow);

      if (overflows.extra().length === 0) {
        // Not ideal. Breaking abstraction somewhat, though remove is better than insert
        // Can just reset the toolbar groups also ... but may be a bit slower.
        Remove.remove(overflow.element());
        drawer.apis().setGroups([ ]);
        // Remove.remove(drawer.element());
      } else {
        var inPrimary = Arr.map(overflows.within(), prebuild);
        var inDrawer = Arr.map(overflows.extra(), prebuild);

        primary.apis().setGroups(inPrimary);
        drawer.apis().setGroups(inDrawer);

        //Insert.append(component.element(), drawer.element());
      }

      // Add the within to the toolbar, and the extra to the more drawer
      // barType.updateWidth

      Css.remove(primary.element(), 'visibility');
      Css.reflow(primary.element());
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