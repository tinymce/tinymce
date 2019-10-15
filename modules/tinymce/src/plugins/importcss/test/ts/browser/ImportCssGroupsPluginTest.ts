import { GeneralSteps, Log, Pipeline, Step, Keys, Keyboard, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { console, document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/importcss/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { MenuNavigationTestUtils } from '../module/MenuNavigationTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.importcss.ImportCssGroupsTest', (success, failure) => {

  Plugin();
  Theme();

  const sTestEditorWithSettings = (assertions, pluginSettings) => Step.async((onStepSuccess, onStepFailure) => {
    TinyLoader.setupLight((editor, onSuccess, onFailure) => {
      const doc = Element.fromDom(document);

      const tinyUi = TinyUi(editor);

      const sOpenStyleMenu = GeneralSteps.sequence([
        tinyUi.sClickOnToolbar('Clicking on the styleselect dropdown', 'button')
      ]);

      const navigationSteps = MenuNavigationTestUtils.generateNavigation(doc, assertions.navigation);

      Pipeline.async({}, Arr.flatten([
        [
          Assertions.sAssertPresence(
            `${assertions.choice.presence} should NOT be present`,
            {
              [assertions.choice.presence]: 0
            },
            Element.fromDom(editor.getBody())
          )
        ],
        [ sOpenStyleMenu ],
        navigationSteps,
        Arr.map(assertions.choice.keysBeforeExecute, (k) => Keyboard.sKeydown(doc, k, { })),
        [ Keyboard.sKeydown(doc, Keys.enter(), { }) ],
        [
          Assertions.sAssertPresence(
            `${assertions.choice.presence} should now be present`,
            {
              [assertions.choice.presence]: 1
            },
            Element.fromDom(editor.getBody())
          )
        ]
      ]), onSuccess, onFailure);
    }, {
      plugins: 'importcss',
      toolbar: 'styleselect',
      theme: 'silver',
      content_css: pluginSettings.content_css,
      importcss_append: pluginSettings.importcss_append,
      importcss_selector_filter: pluginSettings.importcss_selector_filter,
      importcss_file_filter: pluginSettings.importcss_file_filter,
      importcss_groups: pluginSettings.importcss_groups,
      importcss_selector_converter: pluginSettings.importcss_selector_converter,
      importcss_exclusive: pluginSettings.importcss_exclusive,
      base_url: '/project/tinymce/js/tinymce'
    }, () => onStepSuccess(), onStepFailure);
  });

  Pipeline.async({ }, [

    Log.step(
      'TBA',
      'importcss: content_css with three files, append false, groups with overall selector converter',
      sTestEditorWithSettings(
        {
          navigation: [
            { item: 'Other', subitems: [ 'h1.red.DDD', 'p.other.DDD', 'span.inline.DDD' ] },
            { item: 'Advanced', subitems: [ 'h2.advanced.CCC', 'h3.advanced.CCC', 'h4.advanced.CCC' ] }
          ],
          choice: {
            keysBeforeExecute: [ Keys.right() ],
            presence: 'span.converted'
          }
        },
        {
          content_css: [
            '/project/tinymce/src/plugins/importcss/test/css/basic.css',
            '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
            '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
          ],
          importcss_append: false,
          importcss_groups: [
            { title: 'Advanced', filter: /.adv/, custom: '.CCC' },
            { title: 'Other', custom: '.DDD' }
          ],

          importcss_selector_converter: (selector, group) => {
            return {
              title: selector + group.custom,
              classes: [ 'converted' ],
              inline: 'span'
            };
          }
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with three files, append false, groups with group selector converters',
      sTestEditorWithSettings(
        {
          navigation: [
            { item: 'Other', subitems: [ 'h1.red.OtherGroup', 'p.other.OtherGroup', 'span.inline.OtherGroup' ] },
            { item: 'Advanced', subitems: [ 'h2.advanced.AdvGroup', 'h3.advanced.AdvGroup', 'h4.advanced.AdvGroup' ] }
          ],
          choice: {
            keysBeforeExecute: [ Keys.down(), Keys.right() ],
            presence: 'p.advanced'
          }
        },
        {
          content_css: [
            '/project/tinymce/src/plugins/importcss/test/css/basic.css',
            '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
            '/project/tinymce/src/plugins/importcss/test/css/other-adv.css'
          ],
          importcss_append: false,
          importcss_groups: [
            {
              title: 'Advanced',
              filter: /.adv/,
              selector_converter: (selector, group) => {
                // tslint:disable-next-line:no-console
                console.log('selector', selector, 'group', group);
                return {
                  title: selector + '.AdvGroup',
                  // NOTE: This is required so that it isn't disabled.
                  selector: 'p',
                  classes: selector.split('.')[1]
                };
              }
            },
            {
              title: 'Other',
              selector_converter: (selector, group) => {
                return {
                  title: selector + '.OtherGroup',
                  selector: 'p',
                  classes: selector.split('.')[1]
                };
              }
            }
          ]
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with four files (one with clash), groups, and exclusive = false',
      sTestEditorWithSettings(
        {
          navigation: [
            { item: 'Other', subitems: [ 'h1.red', 'p.other', 'span.inline', 'h2.advanced', 'h3.advanced', 'h4.advanced' ] },
            { item: 'Advanced', subitems: [ 'h2.advanced', 'h3.advanced', 'h4.advanced' ] }
          ],
          choice: {
            keysBeforeExecute: [ Keys.right() ],
            presence: 'h1.red'
          }
        },
        {
          content_css: [
            '/project/tinymce/src/plugins/importcss/test/css/basic.css',
            '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
            '/project/tinymce/src/plugins/importcss/test/css/other-adv.css',
            '/project/tinymce/src/plugins/importcss/test/css/clashing.css'
          ],
          importcss_append: false,
          importcss_exclusive: false,
          importcss_groups: [
            { title: 'Advanced', filter: /.adv/ },
            { title: 'Other', custom: 'B' }
          ]
        }
      )
    ),

    Log.step(
      'TBA',
      'importcss: content_css with four files (one with clash), groups, and exclusive = true',
      sTestEditorWithSettings(
        {
          navigation: [
            { item: 'Other', subitems: [ 'h1.red', 'p.other', 'span.inline' ] },
            { item: 'Advanced', subitems: [ 'h2.advanced', 'h3.advanced', 'h4.advanced' ] }
          ],
          choice: {
            keysBeforeExecute: [ Keys.right(), Keys.down() ],
            presence: 'p.other'
          }
        },
        {
          content_css: [
            '/project/tinymce/src/plugins/importcss/test/css/basic.css',
            '/project/tinymce/src/plugins/importcss/test/css/advanced.css',
            '/project/tinymce/src/plugins/importcss/test/css/other-adv.css',
            '/project/tinymce/src/plugins/importcss/test/css/clashing.css'
          ],
          importcss_append: false,
          importcss_exclusive: true,
          importcss_groups: [
            { title: 'Advanced', filter: /.adv/ },
            { title: 'Other', custom: 'B' }
          ]
        }
      )
    )
  ], () => success(), failure);

});
