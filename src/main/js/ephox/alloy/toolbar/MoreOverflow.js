define(
  'ephox.alloy.toolbar.MoreOverflow',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Width'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Arr, Fun, Cell, Css, Insert, InsertAll, Remove, Width) {
    var behaviourName = 'more-overflowing';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.strict('initGroups'),
        FieldSchema.state('state', function () {
          return Cell({ groups: [ ] });
        })
      ])
    );

    var exhibit = function () {
      return DomModification.nu({ });
    };

    var doSetGroups = function (component, oInfo, groups) {
      oInfo.state().set({
        groups: groups
      });
    };

    var doRefresh = function (component, oInfo) {
      // NOTE: Assumes syncComponents has been called.
      var components = component.components();
      var toolbar = components[0];

      
      
      Css.set(toolbar.element(), 'visibility', 'hidden');

      var groups = oInfo.state().get().groups;

      // Clear any restricted width on the toolbar somehow ----- */
      // barType.clearWidth()

      Remove.empty(toolbar.element());
      InsertAll.append(toolbar.element(), Arr.map(groups, function (g) { return g.element(); }));

      var total = Width.get(toolbar.element());

      // NOTE: We need to add the overflow button because it has no width otherwise
      // Note, adding it doesn't affect the width of the toolbar, so it should be fine.
      // var overflows = oInfo.overflows();
      // Insert.append(toolbar, overflows);

      // Clear out the toolbar and the more drawers


      var more = component.apis().getCoupled('more-drawer');
      component.getSystem().addToWorld(more);

      Insert.append(component.element(), more.element());
      component.syncComponents();

      more.apis().replace(groups);
      more.syncComponents();

      

      Remove.empty(toolbar.element());

      // Add the within to the toolbar, and the extra to the more drawer

      // barType.updateWidth

      Css.remove(component.element(), 'visibility');
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