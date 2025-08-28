import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

// eslint-disable-next-line @tinymce/no-publicapi-module-imports
import { Editor, PluginManager, TextPatterns } from 'tinymce/core/api/PublicApi';

// The purpose of this test is to ensure that we have all the types required
// for managing TextPatterns exposed through PublicApi
describe('browser.tinymce.textpatterns.TextPatternsPublicApiTest', () => {
  // This function `make needs to be defined before creating hook.
  const makePlugin = () => {
    PluginManager.add('custom-plugin', (editor) => {

      const replacementLookup: TextPatterns.RawDynamicPatternsLookup = (ctx: TextPatterns.DynamicPatternContext): TextPatterns.RawPattern[] => {
        // Use `setAttribute` on the context's block to ensure it is of type Element
        ctx.block.setAttribute(
          'data-textpattern-text',
          ctx.text
        );

        return [
          // block format
          {
            start: '#',
            format: 'h1'
          },
          // block cmd
          {
            start: '*',
            cmd: 'InsertOrderedList'
          },
          // inline format
          {
            start: '__',
            end: '__',
            format: 'italics'
          },
          // inline cmd
          {
            start: '**',
            end: '**',
            cmd: 'Bold'
          }
        ];
      };

      editor.options.set('text_patterns_lookup', replacementLookup);

      editor.ui.registry.addButton(
        'list-lookups',
        {
          text: 'List lookups',
          onAction: () => {
            const existingLookup: TextPatterns.DynamicPatternsLookup = editor.options.get('text_patterns_lookup');

            const lookups: TextPatterns.Pattern[] = existingLookup({
              block: document.createElement('div'),
              text: 'some-text'
            });

            // This extracted value is meaningless. It's just testing that we have access to
            // all the types we need to classify the various formats. We do test to see if
            // the values go into the content, though.
            const information: string[] = Arr.bind(lookups, (l) => {
              // case match on the types of patterns.
              switch (l.type) {
                case 'block-command': {
                  const bp: TextPatterns.BlockPattern = l;
                  const bl: TextPatterns.BlockCmdPattern = l;
                  return bp === bl ? [ `block-command: ${bl.cmd}` ] : [ ];
                }
                case 'block-format': {
                  const bf: TextPatterns.BlockFormatPattern = l;
                  return [ `block-format: ${bf.format}` ];
                }
                case 'inline-command': {
                  // We use both types here just to check we can.
                  const ip: TextPatterns.InlinePattern = l;
                  const ic: TextPatterns.InlineCmdPattern = l;
                  // The equality here is just to force `ip` to be used.
                  return ip === ic ? [ `inline-command: ${ic.cmd}` ] : [ ];
                }
                case 'inline-format': {
                  const inf: TextPatterns.InlineFormatPattern = l;
                  return [ `inline-format: ${inf.format.join(',')}` ];
                }
                default: {
                  return [ ];
                }
              }
            });

            editor.setContent(
              Arr.map(information, (inf) => `<p>${inf}</p>`).join('\n')
            );
          }
        }
      );

      return {};
    });
  };

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: [ 'custom-plugin' ],
    toolbar: 'list-lookups'
  }, [ makePlugin ]);

  it('TINY-9053: all required types for managing text patterns are exported through PublicApi', () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button');
    TinyAssertions.assertContent(
      editor,
      [
        '<p>block-format: h1</p>',
        '<p>block-command: InsertOrderedList</p>',
        '<p>inline-format: italics</p>',
        '<p>inline-command: Bold</p>'
      ].join('\n')
    );
  });
});
