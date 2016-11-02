define(
  'ephox.alloy.form.CustomRadioGroupSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.epithet.Id',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Checked',
    'ephox.sugar.api.SelectorFind'
  ],

  function (SystemEvents, EventHandler, Tagger, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Id, Merger, Option, Attr, Checked, SelectorFind) {
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
      FieldSchema.strict('uid'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('label'),
      FieldSchema.strict('candidates'),
      FieldSchema.option('selectedValue'),

      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('itemClass'),
          FieldSchema.strict('selectedClass')
        ])
      ),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('radio')
        ])
      ),
  
      FieldSchema.state('builder', function () {
        return builder;
      })
    ].concat(
      SpecSchema.getPartsSchema([
        'legend'
      ])
    );

    var valueAttr = 'data-alloy-radio-value';


    // '<alloy.form.field-input>': UiSubstitutes.single(
    //       info.parts().field()
    //     ),
    //     '<alloy.form.field-label>': UiSubstitutes.single(
    //       Merger.deepMerge(

    var builder = function (info) {
      var placeholders = {
        '<alloy.form.radio-fields>': UiSubstitutes.multiple(
          Arr.bind(info.candidates(), function (candidate, i) {
            return [
              Merger.deepMerge(
                info.members().radio().munge(candidate),
                {
                  uiType: 'button',
                  dom: {
                    attributes: Objects.wrapAll(
                      [ 
                        { key: 'role', value: 'radio' },
                        { key: valueAttr, value: candidate.value },
                        { key: 'aria-checked', value: 'false' }
                      ]
                    )
                  },
                  focusing: true,
                  events: Objects.wrap(
                    SystemEvents.execute(),
                    EventHandler.nu({
                      run: function (radio) {
                        radio.getSystem().getByUid(info.uid()).each(function (group) {
                          group.apis().highlight(radio);
                        });
                      }
                    })
                  ),
                  representing: {
                    query: function (radio) {
                      return candidate.value;
                    },
                    set: function () { }
                  }
                }
              )
            ];
          })
        ),
        '<alloy.form.field-legend>': UiSubstitutes.single(
          {
            uiType: 'custom',
            dom: {
              tag: 'legend',
              innerHtml: info.label()
            }
          }
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('radio-group'),
        info,
        info.components(),
        placeholders,
        { }
      );

      var getItemBy = function (group, value) {
        return SelectorFind.descendant(group.element(), '[' + valueAttr + '="' + value + '"]').bind(function (itemDom) {
          return group.getSystem().getByDom(itemDom).fold(Option.none, Option.some);
        });
      };

      return {
        uiType: 'custom',
        keying: {
          mode: 'flow',
          selector: '.' + info.markers().itemClass(),
          executeOnMove: true,
          getInitial: function (group) {
            return group.apis().getHighlighted().map(function (item) {
              return item.element();
            });
          }
        },
        highlighting: {
          itemClass: info.markers().itemClass(),
          highlightClass: info.markers().selectedClass(),
          onHighlight: function (group, item) {
            Attr.set(item.element(), 'aria-checked', 'true');
          },
          onDehighlight: function (group, item) {
            Attr.set(item.element(), 'aria-checked', 'false');
          }
        },
        representing: {
          query: function (group) {
            return group.apis().getHighlighted().map(function (item) {
              return item.apis().getValue();
            }).getOr(null);
          },
          set: function (group, value) {
            getItemBy(group, value).each(function (item) {
              group.apis().highlight(item);
            });
          }
        },
        events: Objects.wrap(
          SystemEvents.systemInit(),
          EventHandler.nu({
            run: function (group) {
              info.selectedValue().orThunk(function () {
                group.apis().highlightFirst();
                return group.apis().getHighlighted().map(function (item) {
                  return item.apis().getValue();
                });
              }).each(function (val) {
                group.apis().setValue(val);
              });
            }
          })
        ),
        tabstopping: true,
        uid: info.uid(),
        dom: info.dom(),
        components: components
      };
    };

    return schema;
  }
);