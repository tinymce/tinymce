asynctest(
  'TypeaheadSpecTest',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.RealKeys',
    'ephox.agar.api.UiControls',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.typeahead.TestTypeaheadList',
    'ephox.alloy.test.typeahead.TestTypeaheadSteps',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Value',
    'global!Math'
  ],
 
  function (FocusTools, Keyboard, Keys, RealKeys, UiControls, GuiFactory, Container, TieredMenu, Typeahead, GuiSetup, Sinks, TestTypeaheadList, TestTypeaheadSteps, Future, Result, Value, Math) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.relativeSink();

      return GuiFactory.build(
        Container.sketch({
          components: [
            GuiFactory.premade(sink),
            Typeahead.sketch({
              uid: 'test-type',
              minChars: 2,
              dom: {
                tag: 'input'
              },
              data: {
                value: 'initial-value',
                text: 'initial-value'
              },

              markers: {
                openClass: 'test-typeahead-open'
              },

              fetch: function (input) {
                var text = Value.get(input.element());
                var future = Future.pure([
                  { type: 'item', data: { value: text + '1', text: text + '1' } },
                  { type: 'item', data: { value: text + '2', text: text + '2' } }
                ]);

                return future.map(function (f) {
                  // TODO: Test this.
                  var items = text === 'no-data' ? [
                    { type: 'separator', text: 'No data' }
                  ] : f;
                  return TieredMenu.simpleData('blah', 'Blah', items);
                });
              },
              
              lazySink: function () { return Result.value(sink); },

              parts: {
                menu: TestTypeaheadList
              }
            })
          ]
        })
      );

    }, function (doc, body, gui, component, store) {

      var typeahead = gui.getByUid('test-type').getOrDie();
      var steps = TestTypeaheadSteps(doc, gui, typeahead);

      return [
        FocusTools.sSetFocus('Focusing typeahead', gui.element(), 'input'),

        GuiSetup.mAddStyles(doc, [
          '.test-typeahead-selected-item { background-color: #cadbee; }'
        ]),

        steps.sAssertValue('Initial value of typeahead', 'initial-value'),
        UiControls.sSetValue(typeahead.element(), 'a-'),

        // check that the typeahead is not open.
        steps.sWaitForNoMenu('Initially, there should be no menu'),

        RealKeys.sSendKeysOn(
          'input',
          [
            RealKeys.text('test-page')
          ]
        ),

        steps.sWaitForMenu('User typed into input'),

        // Focus should still be in the typeahead.
        steps.sAssertFocusOnTypeahead('Focus after menu shows up'),

        RealKeys.sSendKeysOn(
          'input',
          [
            RealKeys.backspace()
          ]
        ),

        // Focus should still be in the typeahead.
        steps.sAssertFocusOnTypeahead('Focus after backspace'),
        
        Keyboard.sKeydown(doc, Keys.down(), { }),
        // Focus should still be in the typeahead.
        steps.sAssertFocusOnTypeahead('Focus after <down>')
      ];
    }, function () { success(); }, failure);

  }
);