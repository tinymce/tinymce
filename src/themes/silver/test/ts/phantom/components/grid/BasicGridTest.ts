import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { renderGrid } from 'tinymce/themes/silver/ui/dialog/Grid';

import { GuiSetup } from '../../../module/AlloyTestUtils';

// TODO: Expose properly through alloy.
UnitTest.asynctest('Grid component Test', (success, failure) => {

  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderGrid({
          type: 'grid',
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
         }, {
           interpreter: (x) => x
         })
      );
    },
    (doc, body, gui, component, store) => {
      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-form'), arr.has('tox-form--10col')],
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