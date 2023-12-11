import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyApis, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { BeforeGetContentEvent, BeforeSetContentEvent, GetContentEvent, SetContentEvent } from 'tinymce/core/api/EventTypes';
import AstNode from 'tinymce/core/api/html/Node';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const defaultExpectedEvents = [
  'beforesetcontent',
  'setcontent',
  'beforegetcontent',
  'getcontent'
];

describe('browser.tinymce.core.content.EditorContentTest', () => {
  const isSafari = PlatformDetection.detect().browser.isSafari();

  const toHtml = (node: AstNode): string => HtmlSerializer({}).serialize(node);

  const assertContentTreeEqualToHtml = (editor: Editor, html: string, msg: string) => {
    const tree = editor.getContent({ format: 'tree' });
    assert.equal(toHtml(tree), html, msg);
  };

  const getFontTree = (): AstNode => {
    const body = new AstNode('body', 11);
    const font = new AstNode('font', 1);
    const text = new AstNode('#text', 3);

    text.value = 'x';
    font.attr('size', '7');
    font.append(text);
    body.append(font);

    return body;
  };

  const testSetContentTreeWithContentAlteredInBeforeSetContent = (editor: Editor, alteredContent: string, msg: string, expectedContent?: string) => {
    editor.setContent('<p>tree</p>');
    editor.once('BeforeSetContent', (e) => {
      assert.equal(e.content, '<font size="7">x</font>');
      e.content = alteredContent;
    });
    editor.setContent(getFontTree());
    assert.equal(editor.getContent(), expectedContent ?? alteredContent, msg);
  };

  const testGetContentTreeWithContentAlteredInGetContent = (editor: Editor, alteredContent: string, msg: string, expectedContent?: string) => {
    editor.setContent('<p>tree</p>');
    editor.once('GetContent', (e) => {
      assert.equal(e.content, '<p>tree</p>');
      e.content = alteredContent;
    });
    assertContentTreeEqualToHtml(editor, expectedContent ?? alteredContent, msg);
  };

  Arr.each(
    [
      {
        inline: true
      },
      {
        inline: false
      },
      {
        inline: true,
        xss_sanitization: false
      },
      {
        inline: false,
        xss_sanitization: false
      }
    ], (options) => {
      context(`Test with inline: ${options.inline} and xss_sanitization: ${options.xss_sanitization}`, () => {
        let events: EditorEvent<SetContentEvent | GetContentEvent | BeforeSetContentEvent | BeforeGetContentEvent>[] = [];
        const hook = TinyHooks.bddSetupLight<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          setup: (editor: Editor) => {
            editor.on('BeforeGetContent GetContent BeforeSetContent SetContent', (e) => {
              events.push(e);
            });
          },
          ...options
        }, []);

        const assertEventsFiredInOrder = (expectedEvents: string[] = defaultExpectedEvents) => {
          const names = Arr.map(events, (e) => e.type);
          assert.deepEqual(names, expectedEvents, 'Get content events should have been fired');
        };

        const assertEventsContentType = () => {
          const isExpectedTypes = Arr.forall(events, (e) => e.type === 'beforegetcontent' ? Type.isUndefined(e.content) : Type.isString(e.content));
          assert.isTrue(isExpectedTypes);
        };

        const testGetTextContent = (content: string, expected: string, format: 'html' | 'raw' = 'html') => {
          const editor = hook.editor();
          editor.setContent(content, { format });
          TinyAssertions.assertContent(editor, expected, { format: 'text' });
          assertEventsFiredInOrder();
          assertEventsContentType();
        };

        const clearEvents = () => events = [];

        beforeEach(() => clearEvents());

        it('TBA: getContent html', () => {
          const editor = hook.editor();
          editor.setContent('<p>html</p>');
          const html = editor.getContent();
          assert.equal(html, '<p>html</p>', 'Should be expected html');
          assertEventsFiredInOrder();
          assertEventsContentType();
        });

        it('TINY-6281: getContent html with empty editor', () => {
          const editor = hook.editor();
          editor.setContent('');
          const html = editor.getContent();
          assert.equal(html, '', 'Should be expected html');
          assertEventsFiredInOrder();
          assertEventsContentType();
        });

        it('TINY-6281: getContent text', () => testGetTextContent('<p>Text to be retrieved</p>', 'Text to be retrieved'));

        it('TINY-8578: getContent text, empty line in div', () => testGetTextContent('<div><p></p></div>', ''));

        it('TINY-8578: getContent text, empty line', () => testGetTextContent('<p></p>', ''));

        it('TINY-8578: getContent text, two empty lines in div', () => testGetTextContent('<div><p></p><p></p></div>', '\n\n'));

        it('TINY-8578: getContent text, repeating two empty lines in divs', () => testGetTextContent('<div><p></p><p></p></div><div><p></p><p></p></div>', '\n\n\n\n\n\n'));

        it('TINY-8578: getContent text, two empty lines', () => testGetTextContent('<p></p><p></p>', '\n\n'));

        it('TINY-8578: getContent text with bogus element', () => testGetTextContent(`<p data-mce-bogus="all">content</p><p></p>`, '', 'raw'));

        it('TINY-6281: getContent text with empty editor', () => testGetTextContent('', ''));

        it('TBA: getContent tree', () => {
          const editor = hook.editor();
          editor.setContent('<p>tree</p>');
          assertContentTreeEqualToHtml(editor, '<p>tree</p>', 'Should be expected tree html');
          assertEventsFiredInOrder();
          assertEventsContentType();
        });

        it('TINY-6281: getContent tree with empty editor', () => {
          const editor = hook.editor();
          editor.setContent('');
          // bogus br that sits in an empty editor is replaced with a &nbsp; by the html parser, hence the space
          assertContentTreeEqualToHtml(editor, '<p> </p>', 'Should be expected tree html');
          assertEventsFiredInOrder();
          assertEventsContentType();
        });

        it('TBA: getContent tree filtered', () => {
          const editor = hook.editor();
          editor.setContent('<p><font size="7">x</font></p>', { format: 'raw' });
          assertContentTreeEqualToHtml(editor, '<p><span style="font-size: 300%;">x</span></p>', 'Should be expected tree filtered html');
          assertEventsFiredInOrder();
          assertEventsContentType();
        });

        it('TBA: setContent html', () => {
          const editor = hook.editor();
          editor.setContent('<p>html</p>');
          editor.setContent('<p>new html</p>');
          TinyAssertions.assertContent(editor, '<p>new html</p>');
          assertEventsFiredInOrder([
            'beforesetcontent',
            'setcontent',
            'beforesetcontent',
            'setcontent',
            'beforegetcontent',
            'getcontent'
          ]);
          assertEventsContentType();
        });

        it('TBA: setContent tree', () => {
          const editor = hook.editor();
          editor.setContent('<p>tree</p>');
          const tree = editor.getContent({ format: 'tree' });
          assert.equal(toHtml(tree), '<p>tree</p>', 'Should be expected tree html');

          editor.setContent('<p>new html</p>');
          assert.equal(editor.getContent(), '<p>new html</p>', 'Should be expected html');

          editor.setContent(tree);
          assert.equal(editor.getContent(), '<p>tree</p>', 'Should be expected tree html');
          assertEventsFiredInOrder([
            'beforesetcontent',
            'setcontent',
            'beforegetcontent',
            'getcontent',
            'beforesetcontent',
            'setcontent',
            'beforegetcontent',
            'getcontent',
            'beforesetcontent',
            'setcontent',
            'beforegetcontent',
            'getcontent'
          ]);
          assertEventsContentType();
        });

        it('TBA: setContent tree filtered', () => {
          const editor = hook.editor();
          editor.setContent('<p>tree</p>');
          editor.setContent(getFontTree());
          if (options.inline) {
            assert.equal(editor.getContent(), '<span style="font-size: 300%;">x</span>', 'Should be expected filtered html');
          } else {
            assert.equal(editor.getContent(), '<p><span style="font-size: 300%;">x</span></p>', 'Should be expected filtered html');
          }
          assertEventsFiredInOrder([
            'beforesetcontent',
            'setcontent',
            'beforesetcontent',
            'setcontent',
            'beforegetcontent',
            'getcontent'
          ]);
          assertEventsContentType();
        });

        it('TBA: setContent tree using public api', () => {
          const editor = hook.editor();
          editor.setContent('<p>tree</p>');
          editor.setContent(getFontTree());
          if (options.inline) {
            assert.equal(editor.getContent(), '<span style="font-size: 300%;">x</span>', 'Should be expected filtered html');
          } else {
            assert.equal(editor.getContent(), '<p><span style="font-size: 300%;">x</span></p>', 'Should be expected filtered html');
          }
          assertEventsFiredInOrder([
            'beforesetcontent',
            'setcontent',
            'beforesetcontent',
            'setcontent',
            'beforegetcontent',
            'getcontent'
          ]);
          assertEventsContentType();
        });

        it('TINY-7956: Get content without firing events', () => {
          const editor = hook.editor();
          editor.setContent('<p>html</p>');
          clearEvents();
          const html = editor.getContent({ no_events: true });
          assert.equal(html, '<p>html</p>', 'Should be expected html');
          assertEventsFiredInOrder([]);
          assertEventsContentType();
        });

        it('TINY-7956: Set content without firing events', () => {
          const editor = hook.editor();
          editor.setContent('<p>html</p>', { no_events: true });
          assertEventsFiredInOrder([]);
          assertEventsContentType();
        });

        it('TINY-9140: Insert content without firing events', () => {
          const editor = hook.editor();
          editor.setContent('<p>html</p>', { no_events: true });
          assertEventsFiredInOrder([]);
          assertEventsContentType();
        });

        it('TINY-7996: Set tree content with content altered in BeforeSetContent', () => {
          const editor = hook.editor();
          testSetContentTreeWithContentAlteredInBeforeSetContent(editor, '<p>replaced</p>', 'Should be replaced html');
        });

        it('TINY-7996: Get tree content with content altered in GetContent', () => {
          const editor = hook.editor();
          testGetContentTreeWithContentAlteredInGetContent(editor, '<p>replaced</p>', 'Should be replaced html');
        });

        it('TINY-10088: Preserve attributes with self closed HTML tag', () => {
          const content = '<div data-some-attribute="title=<br/>">abc</div>';
          const editor = hook.editor();
          editor.setContent(content);
          TinyAssertions.assertContent(editor, content, { format: 'raw' });
        });

        const initialContent = '<p>initial</p>';
        const newContent = '<p>new content</p>';
        const manipulatedContent = '<p>manipulated</p>';
        Arr.each([
          [ 'setContent', manipulatedContent ],
          [ 'insertContent', `${manipulatedContent}\n${initialContent}` ]
        ] as const, ([ action, result ]) => {
          it(`TINY-9143: Can manipulate content in "BeforeSetContent" callback when called from "${action}" function`, () => {
            const editor = hook.editor();
            editor.setContent(initialContent);
            editor.once('BeforeSetContent', (e) => {
              assert.equal(e.content, newContent);
              e.content = manipulatedContent;
            });
            editor[action](newContent);
            TinyAssertions.assertContent(editor, result);
          });
        });

        context('ZWNBSP', () => {
          const initial = '<p>te\uFEFFst</p>';
          const final = '<p>test</p>';

          it('TINY-10305: setContent html should strip ZWNBSP', () => {
            const editor = hook.editor();
            editor.setContent(initial);
            TinyAssertions.assertRawContent(editor, final);
          });

          it('TINY-10305: setContent raw should strip ZWNBSP', () => {
            const editor = hook.editor();
            editor.setContent(initial, { format: 'raw' });
            TinyAssertions.assertRawContent(editor, final);
          });

          it('TINY-10305: setContent tree should strip ZWNBSP', () => {
            const editor = hook.editor();

            const tree = new AstNode('body', 11);
            const p = new AstNode('p', 1);
            const text = new AstNode('#text', 3);
            text.value = 'te\uFEFFst';
            p.append(text);
            tree.append(p);

            editor.setContent(tree);
            TinyAssertions.assertRawContent(editor, final);
          });

          it('TINY-10305: getContent html should strip ZWNBSP', () => {
            const editor = hook.editor();
            TinyApis(editor).setRawContent(initial);
            const content = editor.getContent();
            assert.equal(content, final, 'ZWNBSP should be stripped');
          });
        });

        context('iframe sandboxing', () => {
          context('sandbox_iframes default', () => {
            const hook = TinyHooks.bddSetupLight<Editor>({
              ...options,
              base_url: '/project/tinymce/js/tinymce'
            }, []);

            it('TINY-10348: Iframe should not be sandboxed by default', () => {
              const editor = hook.editor();
              editor.setContent('<iframe src="about:blank"></iframe>');
              TinyAssertions.assertContent(editor, '<p><iframe src="about:blank"></iframe></p>');
            });
          });

          context('sandbox_iframes: false', () => {
            const hook = TinyHooks.bddSetupLight<Editor>({
              ...options,
              base_url: '/project/tinymce/js/tinymce',
              sandbox_iframes: false
            }, []);

            it('TINY-10348: Iframe should not be sandboxed when sandbox_iframes: false', () => {
              const editor = hook.editor();
              editor.setContent('<iframe src="about:blank"></iframe>');
              TinyAssertions.assertContent(editor, '<p><iframe src="about:blank"></iframe></p>');
            });

            it('TINY-10348: Iframe with sandbox attribute should not be modified when sandbox_iframes: false', () => {
              const editor = hook.editor();
              editor.setContent('<iframe src="about:blank" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>');
              TinyAssertions.assertContent(editor, '<p><iframe src="about:blank" sandbox="allow-scripts allow-same-origin allow-forms"></iframe></p>');
            });
          });

          context('sandbox_iframes: true', () => {
            const hook = TinyHooks.bddSetupLight<Editor>({
              ...options,
              base_url: '/project/tinymce/js/tinymce',
              sandbox_iframes: true
            }, []);

            it('TINY-10348: Iframe should be sandboxed when sandbox_iframes: true', () => {
              const editor = hook.editor();
              editor.setContent('<iframe src="about:blank"></iframe>');
              TinyAssertions.assertContent(editor, '<p><iframe src="about:blank" sandbox=""></iframe></p>');
            });

            it('TINY-10348: Iframe with sandbox attribute should be sandboxed when sandbox_iframes: true', () => {
              const editor = hook.editor();
              editor.setContent('<iframe src="about:blank" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>');
              TinyAssertions.assertContent(editor, '<p><iframe src="about:blank" sandbox=""></iframe></p>');
            });
          });
        });

        context('Convert unsafe embeds', () => {
          const setAndAssertEmbed = (editor: Editor, embedHtml: string, expectedHtml: string) => {
            editor.setContent(embedHtml);
            TinyAssertions.assertContent(editor, `<p>${expectedHtml}</p>`);
          };

          const testNoConversion = (hook: TinyHooks.Hook<Editor>, embedHtml: string) => () => {
            const editor = hook.editor();
            setAndAssertEmbed(editor, embedHtml, embedHtml);
          };

          const testConversion = (hook: TinyHooks.Hook<Editor>, embedHtml: string, expectedHtml: string) => () => {
            const editor = hook.editor();
            setAndAssertEmbed(editor, embedHtml, expectedHtml);
          };

          context('convert_unsafe_embeds default', () => {
            const hook = TinyHooks.bddSetupLight<Editor>({
              ...options,
              base_url: '/project/tinymce/js/tinymce'
            }, []);

            it('TINY-10349: Object elements should not be converted', testNoConversion(hook, '<object data="about:blank"></object>'));
            it('TINY-10349: Embed elements should not be converted', testNoConversion(hook, '<embed src="about:blank">'));
          });

          context('convert_unsafe_embeds: false', () => {
            const hook = TinyHooks.bddSetupLight<Editor>({
              ...options,
              base_url: '/project/tinymce/js/tinymce',
              convert_unsafe_embeds: false
            }, []);

            it('TINY-10349: Object elements should not be converted', testNoConversion(hook, '<object data="about:blank"></object>'));
            it('TINY-10349: Embed elements should not be converted', testNoConversion(hook, '<embed src="about:blank">'));
          });

          context('convert_unsafe_embeds: true', () => {
            const hook = TinyHooks.bddSetupLight<Editor>({
              ...options,
              base_url: '/project/tinymce/js/tinymce',
              convert_unsafe_embeds: true
            }, []);

            it('TINY-10349: Object elements should be converted to iframe',
              testConversion(hook, '<object data="about:blank"></object>', '<iframe src="about:blank"></iframe>'));

            it('TINY-10349: Embed elements should be converted to iframe',
              testConversion(hook, '<embed src="about:blank">', '<iframe src="about:blank"></iframe>'));
          });

          context('convert_unsafe_embeds: true, sandbox_iframes: true', () => {
            const hook = TinyHooks.bddSetupLight<Editor>({
              ...options,
              base_url: '/project/tinymce/js/tinymce',
              convert_unsafe_embeds: true,
              sandbox_iframes: true
            }, []);

            it('TINY-10349: Object elements should be converted to sandboxed iframe',
              testConversion(hook, '<object data="about:blank"></object>', '<iframe src="about:blank" sandbox=""></iframe>'));

            it('TINY-10349: Embed elements should be converted to sandboxed iframe',
              testConversion(hook, '<embed src="about:blank">', '<iframe src="about:blank" sandbox=""></iframe>'));
          });
        });
      });
    }
  );

  Arr.each([
    { inline: true },
    { inline: false }
  ], (options) => {
    context('Unsanitized content', () => {
      const unsanitizedHtml = '<p id="action">XSS</p>';
      const htmlText = 'XSS';

      context(`TINY-9600: Test unsanitized content with inline: ${options.inline} and xss_sanitization: true`, () => {
        const hook = TinyHooks.bddSetupLight<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          xss_sanitization: true,
          ...options
        }, []);

        const sanitizedHtml = '<p>XSS</p>';

        it('setContent with unsanitized content should set sanitized html', () => {
          const editor = hook.editor();
          editor.setContent(unsanitizedHtml);
          TinyAssertions.assertContent(editor, sanitizedHtml);
        });

        it('getContent html with unsanitized content should get sanitized html', () => {
          const editor = hook.editor();
          editor.setContent(unsanitizedHtml);
          const content = editor.getContent();
          assert.equal(content, sanitizedHtml, 'Unsanitized html should be sanitized');
        });

        it('getContent text with unsanitized content should get text from sanitized content', () => {
          const editor = hook.editor();
          editor.setContent(unsanitizedHtml);
          const text = editor.getContent({ format: 'text' });
          assert.equal(text, htmlText, 'Text should be retrieved from sanitized html');
        });

        it('getContent tree with unsanitized content should get sanitized tree', () => {
          const editor = hook.editor();
          editor.setContent(unsanitizedHtml);
          assertContentTreeEqualToHtml(editor, sanitizedHtml, 'Unsanitized html should be sanitized');
        });

        it('setContent tree with content altered in BeforeSetContent should set sanitized html', () => {
          const editor = hook.editor();
          testSetContentTreeWithContentAlteredInBeforeSetContent(editor, unsanitizedHtml, 'Replaced content should be sanitized', sanitizedHtml);
        });

        it('getContent tree with content altered in GetContent should get sanitized html', () => {
          const editor = hook.editor();
          testGetContentTreeWithContentAlteredInGetContent(editor, unsanitizedHtml, 'Replaced content should be sanitized', sanitizedHtml);
        });
      });

      context(`TINY-9600: Test unsanitized content with inline: ${options.inline} and xss_sanitization: false`, () => {
        const hook = TinyHooks.bddSetupLight<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          xss_sanitization: false,
          ...options
        }, []);

        it('setContent with unsanitized content should set content unaltered', () => {
          const editor = hook.editor();
          editor.setContent(unsanitizedHtml);
          TinyAssertions.assertContent(editor, unsanitizedHtml);
        });

        it('getContent html with unsanitized content should get content unaltered', () => {
          const editor = hook.editor();
          editor.setContent(unsanitizedHtml);
          const content = editor.getContent();
          assert.equal(content, unsanitizedHtml, 'Unsanitized html should not be altered');
        });

        it('getContent html with iframe with child node should get the content as expected and not error', () => {
          const editor = hook.editor();
          editor.setContent('<p><iframe><p>test</p></iframe></p>');
          const content = editor.getContent();
          assert.equal(content,
            // TINY-9624: Safari seems to encode the contents of iframes
            isSafari
              ? '<p><iframe>&lt;p&gt;test&lt;/p&gt;</iframe></p>'
              : '<p><iframe><p>test</p></iframe></p>',
            'getContent should not error when there is iframes with child nodes in content');
        });

        it('getContent text with unsanitized content should get text from unsanitized content', () => {
          const editor = hook.editor();
          editor.setContent(unsanitizedHtml);
          const text = editor.getContent({ format: 'text' });
          assert.equal(text, htmlText, 'Text content from unsanitized html should not be altered');
        });

        it('getContent tree with unsanitized content should get unsanitized tree', () => {
          const editor = hook.editor();
          editor.setContent(unsanitizedHtml);
          assertContentTreeEqualToHtml(editor, unsanitizedHtml, 'Unsanitized html should not be altered');
        });

        it('setContent tree with content altered to unsanitized html in BeforeSetContent should set unsanitized html', () => {
          const editor = hook.editor();
          testSetContentTreeWithContentAlteredInBeforeSetContent(editor, unsanitizedHtml, 'Replaced content should be unaltered unsanitized html');
        });

        it('getContent tree with content altered to unsanitized html in GetContent should get unsanitized html', () => {
          const editor = hook.editor();
          testGetContentTreeWithContentAlteredInGetContent(editor, unsanitizedHtml, 'Replaced content should be unaltered unsanitized html');
        });
      });
    });

    context('Content that can cause mXSS via ZWNBSP trimming', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        ...options
      }, []);

      it('TINY-10305: setContent html should sanitize content that can cause mXSS via ZWNBSP trimming', () => {
        const editor = hook.editor();
        editor.setContent('<p>test</p><!--\ufeff><iframe onload=alert(document.domain)>-></body>-->');
        // TINY-10305: Safari escapes text nodes within <iframe>.
        TinyAssertions.assertRawContent(editor, isSafari ? '<p>test</p><!----><p><iframe>-&gt;&lt;/body&gt;--&gt;&lt;/body&gt;</iframe></p>' : '<p>test</p><!---->');
      });

      it('TINY-10305: setContent tree should sanitize content that can cause mXSS via ZWNBSP trimming', () => {
        const editor = hook.editor();

        const tree = new AstNode('body', 11);

        const paragraph = new AstNode('p', 1);
        const pText = new AstNode('#text', 3);
        pText.value = 'test';
        paragraph.append(pText);

        const comment = new AstNode('#comment', 8);
        const cText = new AstNode('#text', 3);
        cText.value = '\ufeff><iframe onload=alert(document.domain)>-></body>';
        comment.append(cText);

        tree.append(paragraph);
        tree.append(comment);

        editor.setContent(tree);
        TinyAssertions.assertRawContent(editor, '<p>test</p><!---->');
      });
    });
  });

  context('SVG elements not enabled by default', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    it('TINY-10237: SVGs is not allowed by default', () => {
      const editor = hook.editor();
      editor.setContent('<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><script>alert(1)</script></circle></svg>');
      TinyAssertions.assertContent(editor, '');
    });
  });

  context('SVG elements', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      extended_valid_elements: 'svg[width|height]'
    }, []);

    it('TINY-10237: Retain SVG content if SVGs are allowed but sanitize them', () => {
      const editor = hook.editor();
      editor.setContent('<svg width="100" height="100" onload="alert(1)"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><script>alert(1)</script></circle></svg>');
      TinyAssertions.assertContent(editor, '<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></svg>');
    });

    it('TINY-10237: Retain SVG content white space', () => {
      const editor = hook.editor();
      const svgHtml = `
        <svg width="100" height="100">
          <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red">
            <desc>foo</desc>
          </circle>
        </svg>
      `.trim();
      editor.setContent(svgHtml);
      TinyAssertions.assertContent(editor, svgHtml);
    });
  });

  context('SVG elements xss_sanitization: false', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      extended_valid_elements: 'svg[width|height]',
      xss_sanitization: false
    }, []);

    it('TINY-10237: Retain SVG content and scripts if sanitization is disabled', () => {
      const editor = hook.editor();
      editor.setContent('<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><script>alert(1)</script></circle></svg>');
      TinyAssertions.assertContent(editor, '<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><script>alert(1)</script></circle></svg>');
    });
  });
});
