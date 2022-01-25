import { UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Attribute, SelectorFilter, SugarElement, SugarHead } from '@ephox/sugar';
import { assert } from 'chai';

import StyleSheetLoader from 'tinymce/core/api/dom/StyleSheetLoader';

describe('browser.tinymce.core.dom.StyleSheetLoaderTest', () => {
  const contentCss = '/project/tinymce/js/tinymce/skins/content/default/content.css';
  const skinCss = '/project/tinymce/js/tinymce/skins/ui/oxide/skin.css';
  let loader: StyleSheetLoader;

  const baseLinkExists = (url: string, head: SugarElement<HTMLHeadElement>) => {
    const links = SelectorFilter.descendants(head, `link[href="${url}"]`);
    assert.lengthOf(links, 1, 'Should have one link loaded');
    assert.equal(Attribute.get(links[0], 'referrerPolicy'), 'origin', 'Should have referrer policy attribute');
    assert.equal(Attribute.get(links[0], 'crossorigin'), 'anonymous', 'Should have crossorigin attribute');
  };

  const linkExists = (url: string) => baseLinkExists(url, SugarHead.head());

  const linkNotExists = (url: string) => UiFinder.notExists(SugarHead.head(), `link[href="${url}"]`);

  const pLoadUrl = (url: string): Promise<void> =>
    loader.load(url);

  const pLoadAllUrls = (urls: string[]): Promise<string[]> =>
    loader.loadAll(urls);

  const unloadUrl = (url: string) => loader.unload(url);

  const unloadAllUrls = (urls: string[]) => loader.unloadAll(urls);

  before(() => {
    loader = StyleSheetLoader(document, {
      maxLoadTime: 500,
      contentCssCors: true,
      referrerPolicy: 'origin'
    });
  });

  it('TINY-3926: Load and then unload removes the loaded stylesheet', async () => {
    await pLoadUrl(contentCss);
    linkExists(contentCss);
    unloadUrl(contentCss);
    linkNotExists(contentCss);
  });

  it('TINY-3926: Load and then unload all urls should leave no stylesheets', async () => {
    await pLoadAllUrls([ contentCss, skinCss ]);
    linkExists(contentCss);
    linkExists(skinCss);
    unloadAllUrls([ skinCss, contentCss ]);
    linkNotExists(contentCss);
    linkNotExists(skinCss);
  });

  it('TINY-3926: Unload removes loaded stylesheets, but only on last reference', async () => {
    // Load 2 links and ensure only one link is loaded
    await pLoadUrl(contentCss);
    await pLoadUrl(contentCss);
    linkExists(contentCss);
    // Unload once shouldn't remove the link
    unloadUrl(contentCss);
    linkExists(contentCss);
    // Unload a second time should remove since the stylesheet was loaded twice
    unloadUrl(contentCss);
    linkNotExists(contentCss);
  });
});
