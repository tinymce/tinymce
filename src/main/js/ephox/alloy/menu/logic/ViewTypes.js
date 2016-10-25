define(
  'ephox.alloy.menu.logic.ViewTypes',

  [
    'ephox.alloy.menu.grid.GridView',
    'ephox.alloy.menu.layered.LayeredView',
    'ephox.alloy.menu.widget.WidgetView',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (GridView, LayeredView, WidgetView, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var schema = FieldSchema.field(
      'view',
      'view',
      FieldPresence.strict(),
      ValueSchema.choose(
        'style',
        {
          layered: LayeredView,
          grid: GridView,
          widget: WidgetView
        }
      )
    );

    var useWidget = function (spec) {
      return {
        style: 'widget',
        members: spec.members,
        markers: spec.markers
      };
    };

    var useGrid = function (spec) {
      return {
        style: 'grid',
        members: spec.members,
        markers: spec.markers
      };
    };

    return {
      schema: Fun.constant(schema),
      useWidget: useWidget,
      useGrid: useGrid
    };
  }
);