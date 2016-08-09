asynctest(
  'GuiEventsTest',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiEvents',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomRender',
    'ephox.alloy.test.TestStore',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'global!document'
  ],
 
  function (FocusTools, Pipeline, Step, GuiEvents, DomDefinition, DomRender, TestStore, Attr, Element, Insert, InsertAll, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var page = DomRender.renderToDom(
      DomDefinition.nu({
        tag: 'div',
        classes: [ 'gui-events-test-container' ],
        defChildren: [
          {
            tag: 'input',
            classes: [ 'test-input' ]
          },
          {
            tag: 'div',
            classes: [ 'test-inner-div' ],
            defChildren: [
              {
                tag: 'span',
                classes: [ 'focusable-span' ],
                attributes: {
                  'tabindex': '-1'
                },
                styles: {
                  width: '200px',
                  height: '200px',
                  border: '1px solid blue',
                  display: 'inline-block'
                }
              }
            ]
          }

        ]
      })
    );

    var body = Element.fromDom(document.body);
    Insert.append(body, page);

    var store = TestStore();


    var triggerEvent = function (eventName, event) {
      store.adder({ eventName: eventName, target: Attr.get(event.target(), 'class') })();
    };

    var gui = GuiEvents.setup(page, {
      triggerEvent: triggerEvent
    });

    Pipeline.async({}, [
      FocusTools.sSetFocus(
        'Focusing test input',
        page,
        '.test-input'
      ),

      store.sAssertEq(
        'Checking event log after focusing test-input',
        [
          { eventName: 'focusin', target: 'test-input' }
        ]
      ),

      Step.wait(1000000)
    ], function () { success(); }, failure);

  }
);