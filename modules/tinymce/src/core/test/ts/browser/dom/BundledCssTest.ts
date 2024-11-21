import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Insert, Remove, SelectorFilter, SugarBody, SugarElement, SugarHead, SugarShadowDom } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TinyMCE } from 'tinymce/core/api/Tinymce';

declare const tinymce: TinyMCE;

type ContentSkin = 'default' | 'dark' | 'writer' | 'document' | 'tinymce-5' | 'tinymce-5-dark';
type UiSkin = 'oxide' | 'oxide-dark' | 'tinymce-5' | 'tinymce-5-dark';

describe('browser.tinymce.core.dom.BundledCssTest', () => {
  const baseUrl = '/project/tinymce/js/tinymce/';
  const skinContentDir = (skin: ContentSkin) => baseUrl + `skins/content/${skin}/`;
  const skinUiDir = (skin: UiSkin) => baseUrl + `skins/ui/${skin}/`;

  const skinContentCss = (skin: ContentSkin, withSuffix: boolean) => skinContentDir(skin) + `content${withSuffix ? '.min' : ''}.css`;
  const skinContentJs = (skin: ContentSkin) => skinContentDir(skin) + `content.js`;

  const skinUiCss = (skin: UiSkin, shadowDom: boolean, withSuffix: boolean) => skinUiDir(skin) + `skin${shadowDom ? '.shadowdom' : ''}${withSuffix ? '.min' : ''}.css`;
  const skinUiJs = (skin: UiSkin, shadowDom: boolean) => skinUiDir(skin) + `skin${shadowDom ? '.shadowdom' : ''}.js`;

  const skinUiContentCss = (skin: UiSkin, inline: boolean, withSuffix: boolean) => skinUiDir(skin) + `content${inline ? '.inline' : ''}${withSuffix ? '.min' : ''}.css`;
  const skinUiContentJs = (skin: UiSkin, inline: boolean) => skinUiDir(skin) + `content${inline ? '.inline' : ''}.js`;

  const styleTagsToKeys = (styleTags: SugarElement<HTMLStyleElement>[]) => {
    return Arr.map(styleTags, (tag) => tag.dom.dataset.mceKey);
  };

  const linkTagsToKeys = (linkTags: SugarElement<HTMLLinkElement>[], basePath: string) => {
    return Arr.map(linkTags, (tag) => tag.dom.href.replace(basePath, ''));
  };

  const getCssTags = (container: SugarElement<HTMLHeadElement | ShadowRoot>) => {
    const style =
      SelectorFilter.descendants<HTMLStyleElement>(
        container,
        'style'
      );
    const link =
      SelectorFilter.descendants<HTMLLinkElement>(
        container,
        'link'
      );

    return {
      style,
      link
    };
  };

  const getIframeCSSTags = (editor: Editor) =>
    getCssTags(SugarShadowDom.getStyleContainer(SugarShadowDom.getRootNode(TinyDom.body(editor))));

  const getCSSContainerTags = (editor: Editor) =>
    getCssTags(SugarShadowDom.getStyleContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor))));

  const pCreateEditor = async (shadowDom: boolean, settings: Record<string, any>) => {
    if (shadowDom) {
      const shadowHost = SugarElement.fromTag('div', document);
      Insert.append(SugarBody.body(), shadowHost);
      const sr = SugarElement.fromDom(shadowHost.dom.attachShadow({ mode: 'open' }));
      const editorDiv = SugarElement.fromTag('div', document);
      Insert.append(sr, editorDiv);

      const cleanup = () => {
        Remove.remove(shadowHost);
      };
      const editor = await McEditor.pFromElement<Editor>(editorDiv, {
        ...settings
      });
      return [ editor, cleanup ] as const;
    } else {
      const editor = await McEditor.pFromSettings<Editor>({
        ...settings
      });
      const cleanup = Fun.noop;
      return [ editor, cleanup ] as const;
    }
  };

  for (const inline of [ false, true ]) {
    context('inline: ' + inline, () => {
      for (const shadowdom of [ false, true ]) {
        context('shadowdom: ' + shadowdom, () => {
          for (const contentCss of [ 'default', 'dark', 'document', 'writer' ] as ContentSkin[]) {
            context('contentCSS: ' + contentCss, () => {
              for (const skin of [ 'oxide', 'oxide-dark', 'tinymce-5', 'tinymce-5-dark' ] as UiSkin[]) {
                context('skin: ' + skin, () => {
                  context('no bundling', () => {
                    it('TINY-11558: Load CSS styesheets as links', async () => {
                      const [ editor, cleanup ] = await pCreateEditor(
                        shadowdom,
                        {
                          inline,
                          skin,
                          ...!inline ? { content_css: contentCss } : {},
                          content_style: '',
                          base_url: '/project/tinymce/js/tinymce'
                        }
                      );
                      const hostUrl = `${editor.baseURI.protocol}://${editor.baseURI.authority}`;

                      if (!inline) {
                        const { style: iframeStyleTags, link: iframeLinkTags } = getIframeCSSTags(editor);
                        assert.isEmpty(iframeStyleTags);
                        assert.lengthOf(iframeLinkTags, 2);
                        assert.includeMembers(
                          linkTagsToKeys(iframeLinkTags, hostUrl),
                          [
                            skinContentCss(contentCss, false),
                            skinUiContentCss(skin, inline, false),
                          ]
                        );
                      }

                      if (shadowdom) {
                        const { style: pageStyleTags, link: pageLinkTags } = getCssTags(SugarHead.head());
                        assert.isEmpty(pageStyleTags);
                        assert.lengthOf(pageLinkTags, 2);
                        assert.includeMembers(
                          linkTagsToKeys(pageLinkTags, hostUrl),
                          [
                            skinUiCss(skin, true, false),
                            '/css/bedrock.css'
                          ]
                        );
                      }

                      const { style: cssStyleTags, link: cssLinkTags } = getCSSContainerTags(editor);
                      assert.isEmpty(cssStyleTags);
                      assert.lengthOf(cssLinkTags, 1 + (inline ? 1 : 0) + (shadowdom ? 0 : 1));
                      assert.includeMembers(
                        linkTagsToKeys(cssLinkTags, hostUrl),
                        [
                          ...shadowdom ? [] : [ '/css/bedrock.css' ],
                          ...inline ? [ skinUiContentCss(skin, inline, false) ] : [],
                          skinUiCss(skin, false, false),
                        ]
                      );

                      McEditor.remove(editor);
                      cleanup();
                    });
                  });

                  context('bundling', () => {
                    const resourceKeys = [
                      `content/${contentCss}/content.css`,
                      `ui/${skin}/content.css`,
                      `ui/${skin}/skin.css`,
                      `ui/${skin}/skin.shadowdom.css`,
                      `ui/${skin}/content.inline.css`,
                    ];

                    const jsScripts = [
                      skinUiJs(skin, false),
                      skinUiJs(skin, true),
                      skinContentJs(contentCss),
                      skinUiContentJs(skin, false),
                      skinUiContentJs(skin, true),
                    ];

                    before(async () => {
                      const scriptsLoaded = tinymce.ScriptLoader.loadScripts(jsScripts)
                        .catch((errors) => {
                          // eslint-disable-next-line no-console
                          console.error(errors);
                          assert.fail('Unable to load scripts');
                        });
                      await scriptsLoaded;

                      for (const key of resourceKeys) {
                        assert.isTrue(tinymce.Resource.has(key));
                      }
                    });

                    after(() => {
                      Arr.each(jsScripts, (url) => tinymce.ScriptLoader.remove(url));
                      Arr.each(resourceKeys, tinymce.Resource.unload);
                    });

                    it('TINY-11558: Load CSS using JS files', async () => {
                      const [ editor, cleanup ] = await pCreateEditor(
                        shadowdom,
                        {
                          inline,
                          skin,
                          ...!inline ? { content_css: contentCss } : {},
                          content_style: '',
                        }
                      );
                      const hostUrl = `${editor.baseURI.protocol}://${editor.baseURI.authority}`;

                      if (!inline) {
                        const { style: iframeStyleTags, link: iframeLinkTags } = getIframeCSSTags(editor);
                        assert.isEmpty(iframeLinkTags);
                        assert.lengthOf(iframeStyleTags, 2);
                        assert.includeMembers(
                          styleTagsToKeys(iframeStyleTags),
                          [
                            contentCss,
                            `ui/${skin}/content.css`
                          ]
                        );
                      }

                      if (shadowdom) {
                        const { style: pageStyleTags, link: pageLinkTags } = getCssTags(SugarHead.head());
                        assert.deepEqual(
                          linkTagsToKeys(pageLinkTags, hostUrl),
                          [ '/css/bedrock.css' ]
                        );
                        assert.lengthOf(pageStyleTags, 1);
                        assert.includeMembers(
                          styleTagsToKeys(pageStyleTags),
                          [
                            `ui/${skin}/skin.shadowdom.css`
                          ]
                        );
                      }

                      const { style: cssStyleTags, link: cssLinkTags } = getCSSContainerTags(editor);
                      assert.deepEqual(
                        linkTagsToKeys(cssLinkTags, hostUrl),
                        shadowdom ? [] : [ '/css/bedrock.css' ]
                      );
                      assert.lengthOf(cssStyleTags, 1 + (inline ? 1 : 0));
                      assert.includeMembers(
                        styleTagsToKeys(cssStyleTags),
                        [
                          `ui/${skin}/skin.css`,
                          ...inline ? [ `ui/${skin}/content.inline.css` ] : [],
                        ]
                      );

                      McEditor.remove(editor);
                      cleanup();
                    });
                  });
                });
              }
            });
          }
        });
      }
    });
  }
});
