import { Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Attribute, SelectorFilter, SugarHead } from '@ephox/sugar';
import { StyleSheetLoader } from 'tinymce/core/api/dom/StyleSheetLoader';

UnitTest.asynctest('browser.tinymce.core.dom.StyleSheetLoaderTest', (success, failure) => {
  const contentCss = '/project/tinymce/js/tinymce/skins/content/default/content.css';
  const skinCss = '/project/tinymce/js/tinymce/skins/ui/oxide/skin.css';
  const loader = StyleSheetLoader(document, {
    maxLoadTime: 500,
    contentCssCors: true,
    referrerPolicy: 'origin'
  });

  const sLinkExists = (url: string) => Step.sync(() => {
    const head = SugarHead.head();
    const links = SelectorFilter.descendants(head, `link[href="${url}"]`);
    Assert.eq('Should have one link loaded', true, links.length === 1);
    Assert.eq('Should have referrer policy attribute', 'origin', Attribute.get(links[0], 'referrerPolicy'));
    Assert.eq('Should have crossorigin attribute', 'anonymous', Attribute.get(links[0], 'crossorigin'));
  });
  const sLinkNotExists = (url: string) => UiFinder.sNotExists(SugarHead.head(), `link[href="${url}"]`);

  const sLoadUrl = (url: string) => Step.async((next, die) => {
    loader.load(url, next, () => die('Failed to load url: ' + url));
  });

  const sLoadAllUrls = (urls: string[]) => Step.async((next, die) => {
    loader.loadAll(urls, next, (failedUrls) => die('Failed to load urls: ' + failedUrls.join(', ')));
  });

  const sUnloadUrl = (url: string) => Step.sync(() => {
    loader.unload(url);
  });

  const sUnloadAllUrls = (urls: string[]) => Step.sync(() => {
    loader.unloadAll(urls);
  });

  Pipeline.async({}, [
    Log.stepsAsStep('TINY-3926', 'Load and then unload removes the loaded stylesheet', [
      sLoadUrl(contentCss),
      sLinkExists(contentCss),
      sUnloadUrl(contentCss),
      sLinkNotExists(contentCss)
    ]),
    Log.stepsAsStep('TINY-3926', 'Load and then unload all urls should leave no stylesheets', [
      sLoadAllUrls([ contentCss, skinCss ]),
      sLinkExists(contentCss),
      sLinkExists(skinCss),
      sUnloadAllUrls([ skinCss, contentCss ]),
      sLinkNotExists(contentCss),
      sLinkNotExists(skinCss)
    ]),
    Log.stepsAsStep('TINY-3926', 'Unload removes loaded stylesheets, but only on last reference', [
      // Load 2 links and ensure only one link is loaded
      sLoadUrl(contentCss),
      sLoadUrl(contentCss),
      sLinkExists(contentCss),
      // Unload once shouldn't remove the link
      sUnloadUrl(contentCss),
      sLinkExists(contentCss),
      // Unload a second time should remove since the stylesheet was loaded twice
      sUnloadUrl(contentCss),
      sLinkNotExists(contentCss)
    ])
  ], success, failure);
});
