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

UnitTest.asynctest('browser.tinymce.themes.silver.bespoke.StyleSelectFormatNamesTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight(
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
          { title: 'Named inline format', element: 'span' },
          { title: 'Named block format', element: 'h1' },
          { title: 'Named selector format', element: 'div' },
          { title: 'Unnamed inline format', element: 'span' },
          { title: 'Unnamed block format', element: 'h1' },
          { title: 'Unnamed selector format', element: 'div' }
        ]),
        sAssertFormatExists('custom-my-inline'),
        sAssertFormatExists('custom-my-block'),
        sAssertFormatExists('custom-my-selector'),
        sAssertFormatExists('custom-unnamed inline format'),
        sAssertFormatExists('custom-unnamed block format'),
        sAssertFormatExists('custom-unnamed selector format')
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      toolbar: 'styleselect',
      base_url: '/project/tinymce/js/tinymce',
      style_formats: [
        {
          name: 'my-inline',
          title: 'Named inline format',
          inline: 'span',
          classes: [ 'my-inline' ]
        },
        {
          name: 'my-block',
          title: 'Named block format',
          block: 'h1',
          classes: [ 'my-block' ]
        },
        {
          name: 'my-selector',
          title: 'Named selector format',
          selector: 'p',
          classes: [ 'my-selector' ]
        },
        {
          title: 'Unnamed inline format',
          inline: 'span',
          classes: [ 'my-inline' ]
        },
        {
          title: 'Unnamed block format',
          block: 'h1',
          classes: [ 'my-block' ]
        },
        {
          title: 'Unnamed selector format',
          selector: 'p',
          classes: [ 'my-selector' ]
        }
      ]
    },
    success,
    failure
  );
});
