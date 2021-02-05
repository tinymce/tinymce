import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import I18n from 'tinymce/core/api/util/I18n';
import { renderGrid } from 'tinymce/themes/silver/ui/dialog/Grid';

describe('phantom.tinymce.themes.silver.components.grid.GridTest', () => {
  const sharedBackstage = {
    interpreter: Fun.identity,
    translate: I18n.translate
  };

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderGrid({
      columns: 10,
      items: [
        {
          dom: {
            tag: 'div',
            classes: [ 'foo' ]
          }
        } as any,
        {
          dom: {
            tag: 'div',
            classes: [ 'bar' ]
          }
        } as any
      ]
    }, sharedBackstage)
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, _str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__grid'), arr.has('tox-form__grid--10col') ],
        children: [
          s.element('div', {
            classes: [ arr.has('foo') ]
          }),
          s.element('div', {
            classes: [ arr.has('bar') ]
          })
        ]
      })),
      hook.component().element
    );
  });
});
