define(
  'ephox.alloy.form.RadioGroupSpec',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.FieldSchema'
  ],

  function (Tagger, FieldSchema) {
    /*
     <fieldset>
       <legend>Border</legend>
       <input type="radio" id="tableborder1_6461071156781477979401488" value="1" name="_6461071156781477979401488">
       <label for="tableborder1_6461071156781477979401488">On</label>
       <input type="radio" id="tableborder0_6461071156781477979401488" value="0" name="_6461071156781477979401488">
       <label for="tableborder0_6461071156781477979401488">Off</label>
     </fieldset>
     */

    var schema = [
      FieldSchema.option('uid'),
      // FieldSchema.strict('components'),
      // FieldSchema.defaulted('dom'),
      // FieldSchema.strict('label'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    // '<alloy.form.field-input>': UiSubstitutes.single(
    //       detail.parts().field()
    //     ),
    //     '<alloy.form.field-label>': UiSubstitutes.single(
    //       Merger.deepMerge(

    var builder = function (info) {
      return {
        uid: info.uid().getOr(Tagger.generate('')),
        dom: {
          tag: 'div'
        },
        components: [
          { uiType: 'placeholder', name: '<alloy.form.radio-fields>', owner: 'radiogroup' },
          { uiType: 'placeholder', name: '<alloy.form.field-legend>', owner: 'radiogroup' }
        ]
      };
    };

    return schema;
  }
);