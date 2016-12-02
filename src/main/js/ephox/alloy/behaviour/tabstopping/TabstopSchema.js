define(
  'ephox.alloy.behaviour.tabstopping.TabstopSchema',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    return [
      FieldSchema.defaulted('tabAttr', 'data-alloy-tabstop')
    ];
  }
);