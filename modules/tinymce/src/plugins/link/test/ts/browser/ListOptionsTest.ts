import { Assertions, Pipeline, Step, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { AnchorListOptions } from 'tinymce/plugins/link/ui/sections/AnchorListOptions';
import { ClassListOptions } from 'tinymce/plugins/link/ui/sections/ClassListOptions';
import { LinkListOptions } from 'tinymce/plugins/link/ui/sections/LinkListOptions';
import { RelOptions } from 'tinymce/plugins/link/ui/sections/RelOptions';
import { TargetOptions } from 'tinymce/plugins/link/ui/sections/TargetOptions';
import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.ListOptionsTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    editor.setContent(
      '<p><a name="Difference"></a>Differences anchor us</p>'
    );

    const sTestAnchors = Log.stepsAsStep('TBA', 'Link: Checking anchor generation',
      [
        tinyApis.sSetContent('<p><a name="Difference"></a>Differences anchor us</p>'),
        Step.sync(() => {

          const anchors = AnchorListOptions.getAnchors(editor).getOr([ ]);
          Assertions.assertEq(
            'Checking anchors found in content',
            [
              { text: 'None', value: '' },
              { text: 'Difference', value: '#Difference' }
            ],
            anchors
          );
        })
      ]
    );

    const sTestLinkClasses = Log.stepsAsStep('TBA', 'Link: Checking link class generation',
      [
        tinyApis.sSetSetting('link_class_list', [
          { title: 'Important', value: 'imp' },
          { title: 'Insignificant', value: 'insig' }
        ]),
        Step.sync(() => {
          const classes = ClassListOptions.getClasses(editor);
          Assertions.assertEq(
            'Checking link classes',
            [
              { text: 'Important', value: 'imp' },
              { text: 'Insignificant', value: 'insig' }
            ],
            classes.getOr([ ])
          );
        })
      ]
    );

    const sTestLinkLists = Log.stepsAsStep('TBA', 'Link: Checking link list generation',
      [
        tinyApis.sSetSetting('link_list', (callback) => {
          callback([
            {
              title: 'Alpha',
              menu: [
                { value: 'alpha-a', title: 'Alpha-A' },
                { value: 'alpha-a', title: 'Alpha-A' }
              ]
            },
            {
              title: 'Beta',
              value: 'beta'
            }
          ]);
        }),
        Step.async((next, die) => {
          LinkListOptions.getLinks(editor).get((links) => {
            try {
              Assertions.assertEq(
                'Checking link_list',
                [
                  { text: 'None', value: '' },
                  // TODO TINY-2236 re-enable this (support will need to be added to bridge)
                  /*
                  {
                    text: 'Alpha',
                    items: [
                      { value: 'alpha-a', text: 'Alpha-A' },
                      { value: 'alpha-a', text: 'Alpha-A' }
                    ]
                  },
                  */
                  {
                    text: 'Beta',
                    value: 'beta'
                  }
                ],
                links.getOr([ ])
              );
              next();
            } catch (e) {
              die(e);
            }
          });
        })
      ]
    );

    const sTestRels = Log.stepsAsStep('TBA', 'Link: Checking rel generation',
      [
        tinyApis.sSetSetting('rel_list', [
          { value: '', text: 'None' },
          { value: 'just one', text: 'Just One' }
        ]),
        Step.sync(() => {
          const rels = RelOptions.getRels(editor, Option.some('initial-target'));
          Assertions.assertEq(
            'Checking rel_list output',
            [
              { value: '', text: 'None' },
              { value: 'just one', text: 'Just One' }
            ],
            rels.getOr([ ])
          );
        })
      ]
    );

    const sTestTargets = Log.stepsAsStep('TBA', 'Link: Checking targets generation',
      [
        tinyApis.sSetSetting('target_list', [
          { value: 'target1', text: 'Target1' },
          { value: 'target2', text: 'Target2' }
        ]),
        Step.sync(() => {
          const targets = TargetOptions.getTargets(editor);
          Assertions.assertEq(
            'Checking target_list output',
            [
              { value: 'target1', text: 'Target1' },
              { value: 'target2', text: 'Target2' }
            ],
            targets.getOr([ ])
          );
        })
      ]
    );

    Pipeline.async({ }, [
      TestLinkUi.sClearHistory,
      sTestAnchors,
      sTestLinkClasses,
      sTestLinkLists,
      sTestRels,
      sTestTargets,
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
