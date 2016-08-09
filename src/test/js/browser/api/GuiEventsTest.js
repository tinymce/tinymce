asynctest(
  'GuiEventsTest',
 
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomRender',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'global!document'
  ],
 
  function (Pipeline, Step, DomDefinition, DomRender, Element, Insert, InsertAll, document) {
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

    Pipeline.async({}, [
      Step.debugging
    ], function () { success(); }, failure);

  }
);