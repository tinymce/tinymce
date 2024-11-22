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

  const styleTagToKey = (styleTag: SugarElement<HTMLStyleElement>) =>
    styleTag.dom.dataset.mceKey || styleTag.dom.id;
  const styleTagsToKeys = (styleTags: SugarElement<HTMLStyleElement>[]) =>
    Arr.map(styleTags, styleTagToKey);

  const linkTagToKey = (linkTag: SugarElement<HTMLLinkElement>, basePath: string) =>
    linkTag.dom.href.replace(basePath, '');
  const linkTagsToKeys = (linkTags: SugarElement<HTMLLinkElement>[], basePath: string) =>
    Arr.map(linkTags, (tag) => linkTagToKey(tag, basePath));

  const getCssTags = (container: SugarElement<HTMLHeadElement | ShadowRoot>, basePath: string) => {
    const styleTags =
      SelectorFilter.descendants<HTMLStyleElement>(
        container,
        'style'
      );
    // An unrelated style tag is included in Firefox so fitler it out
    const filterKeys = new Set([ 'mceDefaultStyles' ]);
    const style = Arr.filter(styleTags, (tag) => {
      const key = styleTagToKey(tag);
      return !filterKeys.has(key);
    });

    const linkTags =
      SelectorFilter.descendants<HTMLLinkElement>(
        container,
        'link'
      );
    const filterHrefs = new Set([ '/css/bedrock.css' ]);
    const link = Arr.filter(linkTags, (tag) => {
      const key = linkTagToKey(tag, basePath);
      return !filterHrefs.has(key);
    });

    return {
      style,
      link
    };
  };

  const getCssKeys = (container: SugarElement<HTMLHeadElement | ShadowRoot>, basePath: string) => {
    const { style, link } = getCssTags(container, basePath);
    return {
      style: styleTagsToKeys(style),
      link: linkTagsToKeys(link, basePath)
    };
  };

  const getIframeCSSKeys = (editor: Editor, basePath: string) =>
    getCssKeys(SugarShadowDom.getStyleContainer(SugarShadowDom.getRootNode(TinyDom.body(editor))), basePath);
  const getCSSContainerKeys = (editor: Editor, basePath: string) =>
    getCssKeys(SugarShadowDom.getStyleContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor))), basePath);
  const getPageCSSKeys = (basePath: string) =>
    getCssKeys(SugarHead.head(), basePath);

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
                    it('TINY-11558: Load CSS stylesheets as links', async () => {
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
                        const { style: iframeStyles, link: iframeLinks } = getIframeCSSKeys(editor, hostUrl);
                        assert.isEmpty(iframeStyles, 'iframe style tags');
                        assert.lengthOf(iframeLinks, 2, 'iframe link tags');
                        assert.includeMembers(
                          iframeLinks,
                          [
                            skinContentCss(contentCss, false),
                            skinUiContentCss(skin, inline, false),
                          ],
                          'iframe link tags'
                        );
                      }

                      if (shadowdom) {
                        const { style: pageStyles, link: pageLinks } = getPageCSSKeys(hostUrl);
                        assert.isEmpty(pageStyles, 'page style tags');
                        assert.lengthOf(pageLinks, 1, 'page link tags');
                        assert.includeMembers(
                          pageLinks,
                          [
                            skinUiCss(skin, true, false)
                          ],
                          'page link tags'
                        );
                      }

                      const { style: cssStyles, link: cssLinks } = getCSSContainerKeys(editor, hostUrl);
                      assert.isEmpty(cssStyles, 'css style tags');
                      assert.lengthOf(cssLinks, 1 + (inline ? 1 : 0), 'css link tags');
                      assert.includeMembers(
                        cssLinks,
                        [
                          ...inline ? [ skinUiContentCss(skin, inline, false) ] : [],
                          skinUiCss(skin, false, false),
                        ],
                        'css link tags'
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
                        const { style: iframeStyles, link: iframeLinks } = getIframeCSSKeys(editor, hostUrl);
                        assert.isEmpty(iframeLinks, 'iframe link tags');
                        assert.lengthOf(iframeStyles, 2, 'iframe style tags');
                        assert.includeMembers(
                          iframeStyles,
                          [
                            contentCss,
                            `ui/${skin}/content.css`
                          ],
                          'iframe style tags'
                        );
                      }

                      if (shadowdom) {
                        const { style: pageStyles, link: pageLinks } = getPageCSSKeys(hostUrl);
                        assert.isEmpty(
                          pageLinks,
                          'page link tags'
                        );
                        assert.lengthOf(pageStyles, 1, 'page style tags');
                        assert.includeMembers(
                          pageStyles,
                          [
                            `ui/${skin}/skin.shadowdom.css`
                          ],
                          'page style tags'
                        );
                      }

                      const { style: cssStyles, link: cssLinks } = getCSSContainerKeys(editor, hostUrl);
                      assert.isEmpty(
                        cssLinks,
                        'css link tags'
                      );
                      assert.lengthOf(cssStyles, 1 + (inline ? 1 : 0), 'css style tags');
                      assert.includeMembers(
                        cssStyles,
                        [
                          `ui/${skin}/skin.css`,
                          ...inline ? [ `ui/${skin}/content.inline.css` ] : [],
                        ],
                        'css style tags'
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
