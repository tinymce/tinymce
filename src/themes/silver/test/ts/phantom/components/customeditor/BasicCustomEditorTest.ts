// TODO: Expose properly through alloy.
import { ApproxStructure, Assertions, Logger, Step, Waiter } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Cell } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';
import { renderCustomEditor } from 'tinymce/themes/silver/ui/dialog/CustomEditor';

import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import Promise from 'tinymce/core/api/util/Promise';

UnitTest.asynctest('CustomEditor component Test', (success, failure) => {
  const resolveInit = Cell(false);
  const customEditorValue = Cell('zztop');

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderCustomEditor({
          tag: 'textarea',
          init: (e) => new Promise((resolve) => {
            const intervalId = setInterval(() => {
              if (resolveInit.get()) {
                clearInterval(intervalId);
                Class.add(Element.fromDom(e), 'my-custom-editor');
                resolve({
                  setValue(s) { customEditorValue.set(s); },
                  getValue() { return customEditorValue.get(); },
                  destroy() {}
                });
              }
            }, 500);
          })
         })
      );
    },
    (doc, body, gui, component, store) => {

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              children: [
                s.element('textarea', {
                  classes: [arr.not('my-custom-editor')]
                })
              ]
            });
          }),
          component.element()
        ),

        RepresentingSteps.sAssertRoundtrip(
          'Roundtripping before initialised',
          component,
          'foo'
        ),

        Logger.t(
          'Set to initialised',
          Step.sync(() => {
            resolveInit.set(true);
          })
        ),

        Waiter.sTryUntil(
          'Waiting for CustomEditor init',
          Assertions.sAssertStructure(
            'Checking structure after init',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                children: [
                  s.element('textarea', {
                    classes: [arr.has('my-custom-editor')]
                  })
                ]
              });
            }),
            component.element()
          ),
          500,
          5000
        ),

        RepresentingSteps.sAssertRoundtrip(
          'Roundtripping after initialised',
          component,
          'bar'
        )
      ];
    },
    success,
    failure
  );
});