import { ApproxStructure, GeneralSteps, Log, Pipeline, Step, StructAssert } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.TableSizingModeTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sTest = (assertion: (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi) => StructAssert, defaultStyles?: Record<string, string>) => GeneralSteps.sequence([
      tinyApis.sSetContent(''),
      defaultStyles ? tinyApis.sSetSetting('table_default_styles', defaultStyles) : tinyApis.sDeleteSetting('table_default_styles'),
      tinyApis.sExecCommand('mceInsertTable', { rows: 2, columns: 2 }),
      tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) => s.element('body', {
        children: [ assertion(s, str), s.theRest() ]
      })))
    ]);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-6051', 'Should default to a percentage width when inserting new tables', [
        tinyApis.sDeleteSetting('table_sizing_mode'),
        sTest((s, str) => s.element('table', {
          styles: {
            'border-collapse': str.is('collapse'),
            'width': str.is('100%')
          }
        })),
        sTest((s, str) => s.element('table', {
          styles: {
            'border-collapse': str.none(),
            'width': str.is('600px')
          }
        }), { width: '600px' })
      ]),
      Log.stepsAsStep('TINY-6051', 'Relative sizing should default to a percentage width when inserting new tables', [
        tinyApis.sSetSetting('table_sizing_mode', 'relative'),
        sTest((s, str) => s.element('table', {
          styles: {
            'border-collapse': str.is('collapse'),
            'width': str.is('100%')
          }
        })),
        sTest((s, str) => s.element('table', {
          styles: {
            'border-collapse': str.none(),
            'width': str.contains('%')
          }
        }), { width: '750px' })
      ]),
      Log.stepsAsStep('TINY-6051', 'Fixed sizing should default to a pixel width when inserting new tables', [
        tinyApis.sSetSetting('table_sizing_mode', 'fixed'),
        sTest((s, str) => s.element('table', {
          styles: {
            'border-collapse': str.is('collapse'),
            'width': str.contains('px')
          }
        })),
        Step.sync(() => {
          const table = editor.dom.select('table')[0];
          Assert.eq('Table is the same width as the body', editor.getBody().offsetWidth, table.offsetWidth);
        }),
        sTest((s, str) => s.element('table', {
          styles: {
            'border-collapse': str.none(),
            'width': str.contains('px')
          }
        }), { width: '100%' })
      ]),
      Log.stepsAsStep('TINY-6051', 'Responsive sizing should default to no width when inserting new tables', [
        tinyApis.sSetSetting('table_sizing_mode', 'responsive'),
        sTest((s, str) => s.element('table', {
          styles: {
            'border-collapse': str.is('collapse'),
            'width': str.none()
          }
        })),
        sTest((s, str) => s.element('table', {
          styles: {
            'border-collapse': str.none(),
            'width': str.none()
          }
        }), { width: '400px' })
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    width: 800,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
