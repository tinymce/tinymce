import Chain from 'ephox/agar/api/Chain';
import FocusTools from 'ephox/agar/api/FocusTools';
import Mouse from 'ephox/agar/api/Mouse';
import Pipeline from 'ephox/agar/api/Pipeline';
import DemoContainer from 'ephox/agar/demo/DemoContainer';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Value } from '@ephox/sugar';



export default <any> function () {
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