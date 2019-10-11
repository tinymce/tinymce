import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { renderGrid } from 'tinymce/themes/silver/ui/dialog/Grid';

import I18n from 'tinymce/core/api/util/I18n';

// TODO: Expose properly through alloy.
UnitTest.asynctest('Grid component Test', (success, failure) => {

  const sharedBackstage = {
    interpreter: (x) => x,
    translate: I18n.translate
  };

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderGrid({
          columns: 10,
          items: [
            {
              dom: {
                tag: 'div',
                classes: ['foo']
              }
            } as any,
            {
              dom: {
                tag: 'div',
                classes: ['bar']
              }
            } as any
          ]
         }, sharedBackstage)
      );
    },
    (doc, body, gui, component, store) => {
      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-form__grid'), arr.has('tox-form__grid--10col')],
              children: [
                s.element('div', {
                  classes: [arr.has('foo')]
                }),
                s.element('div', {
                  classes: [arr.has('bar')]
                })
              ]
            });
          }),
          component.element()
        )
      ];
    },
    success,
    failure
  );
});
