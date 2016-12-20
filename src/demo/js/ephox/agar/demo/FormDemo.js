define(
  'ephox.agar.demo.FormDemo',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.demo.DemoContainer',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.properties.Value'
  ],

  function (Chain, FocusTools, Mouse, Pipeline, DemoContainer, Attr, Css, DomEvent, Element, Html, Insert, InsertAll, Remove, Value) {
    return function () {
      DemoContainer.init(
        'Form Demo',
        function (success, failure) {
          var doc = Element.fromDom(document);

          var form =  Element.fromTag('form');

          var start = Element.fromHtml('<button>Go</button>');
          DomEvent.bind(start, 'click', function () {
            Remove.remove(start);

            

            var labelName = Element.fromTag('label');
            Html.set(labelName, 'Name');
            var fieldName = Element.fromHtml('<input type="text" />');

            var submit = Element.fromTag('button');
            Attr.set(submit, 'type', 'button');
            Html.set(submit, 'Apply');

            DomEvent.bind(submit, 'click', function () {
              if (Value.get(fieldName) !== 'test') Css.set(fieldName, 'border', '3px solid red');
              else Css.remove(fieldName, 'border');
            });

            InsertAll.append(form, [ labelName, fieldName, submit ]);

            // The step version
            /*
            Pipeline.async({}, [
              FocusTools.sSetFocus('Move to field', form, 'input'),
              Step.wait(100),
              FocusTools.sSetActiveValue(doc, 'wrong value'),
              Step.wait(100),
              Mouse.sClickOn(form, 'button:contains("Apply")'),
              Step.wait(1000),
              FocusTools.sSetActiveValue(doc, 'test'),
              Mouse.sClickOn(form, 'button:contains("Apply")'),
              Step.wait(1000)
            ], success, failure);
            */

            // The chain version 
            var cGetForm = Chain.inject(form);
            
            Pipeline.async({}, [
              Chain.asStep({}, [
                Chain.fromParent(cGetForm, [
                  FocusTools.cSetFocus('Move to field', 'input'),
                  Chain.wait(100),
                  FocusTools.cSetActiveValue('wrong value'),
                  Chain.wait(100),
                  Mouse.cClickOn('button:contains("Apply")'),
                  Chain.wait(1000),
                  FocusTools.cSetActiveValue('test'),
                  Mouse.cClickOn('button:contains("Apply")'),
                  Chain.wait(1000)
                ])
              ])
            ], success, failure);


          });

          Insert.append(form, start);

          return [ form ];
        }
      );
    };
  }
);