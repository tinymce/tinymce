define(
  'ephox.alloy.api.ui.HtmlSelect',

  [

  ],

  function () {

    parts: {
          field: Merger.deepMerge(
            info.parts().field(),
            {
              uiType: 'custom',
              dom: {
                tag: 'select'
              },
              representing: { 
                query: function (input) {
                  return Value.get(input.element());
                },
                set: function (input, value) {
                  Value.set(input.element(), value);
                }
              },
              components: options
            }
          ),
          label: { }
        },
        dom: info.dom(),
    return null;
  }
);