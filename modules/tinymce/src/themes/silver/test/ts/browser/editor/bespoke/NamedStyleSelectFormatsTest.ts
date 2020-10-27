import {
  ApproxStructure, Assertions, Chain, Logger, Pipeline, Step, UiFinder
} from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import * as MenuUtils from '../../../module/MenuUtils';

interface StyleSelectMenuItem {
  element: string;
  title: string;
}

UnitTest.asynctest('browser.tinymce.themes.silver.bespoke.NamedStyleSelectFormatTest', (success, failure) => {
  Theme();
  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const sAssertStyleSelectMenuItems = (label: string, expectedItems: StyleSelectMenuItem[]) => Logger.t(
        label,
        Chain.asStep(SugarBody.body(), [
          UiFinder.cFindIn('.tox-selected-menu .tox-collection__group'),
          Assertions.cAssertStructure('Checking structure', ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: Arr.map(expectedItems, (expected) => s.element('div', {
              attrs: {
                role: str.is('menuitemcheckbox'),
                title: str.is(expected.title)
              },
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-collection__item-label') ],
                  children: [
                    s.element(expected.element, {
                      children: [
                        s.text(str.is(expected.title))
                      ]
                    })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-collection__item-checkmark') ],
                  children: [
                    s.anything()
                  ]
                })
              ]
            }))
          })))
        ])
      );

      const sAssertFormatExists = (formatName: string) =>
        Step.sync(() =>
          Assert.eq(`Expected format: ${formatName} to exist`, true, editor.formatter.has(formatName))
        );

      Pipeline.async({ }, [
        MenuUtils.sOpenMenu('Format', 'Paragraph:last'),
        sAssertStyleSelectMenuItems('Checking style select items', [
          { title: 'My inline', element: 'span' },
          { title: 'My block', element: 'h1' },
          { title: 'My selector', element: 'div' }
        ]),
        sAssertFormatExists('my-inline'),
        sAssertFormatExists('my-block'),
        sAssertFormatExists('my-selector')
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      toolbar: 'styleselect',
      base_url: '/project/tinymce/js/tinymce',
      style_formats: [
        {
          name: 'my-inline',
          title: 'My inline',
          inline: 'span',
          classes: [ 'my-inline' ]
        },
        {
          name: 'my-block',
          title: 'My block',
          block: 'h1',
          classes: [ 'my-block' ]
        },
        {
          name: 'my-selector',
          title: 'My selector',
          selector: 'p',
          classes: [ 'my-selector' ]
        }
      ]
    },
    () => {
      success();
    },
    failure
  );
});
