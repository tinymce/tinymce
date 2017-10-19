asynctest(
  'browser.tinymce.core.fmt.ExpandRangeTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.fmt.ExpandRange',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, TinyApis, TinyLoader, Hierarchy, Element, ExpandRange, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    var cSetRawContent = function (html) {
      return Chain.op(function (editor) {
        editor.getBody().innerHTML = html;
      });
    };

    var cExpandRng = function (startPath, startOffset, endPath, endOffset, format, remove) {
      return Chain.mapper(function (editor) {
        var startContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), startPath).getOrDie();
        var endContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), endPath).getOrDie();

        var rng = editor.dom.createRng();
        rng.setStart(startContainer.dom(), startOffset);
        rng.setEnd(endContainer.dom(), endOffset);

        return ExpandRange.expandRng(editor, rng, format, remove);
      });
    };

    var cAssertRange = function (editor, startPath, startOffset, endPath, endOffset) {
      return Chain.op(function (rng) {
        var startContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), startPath).getOrDie();
        var endContainer = Hierarchy.follow(Element.fromDom(editor.getBody()), endPath).getOrDie();

        Assertions.assertDomEq('Should be expected start container', startContainer, Element.fromDom(rng.startContainer));
        Assertions.assertEq('Should be expected start offset', startOffset, rng.startOffset);
        Assertions.assertDomEq('Should be expected end container', endContainer, Element.fromDom(rng.endContainer));
        Assertions.assertEq('Should be expected end offset', endOffset, rng.endOffset);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var inlineFormat = [{ inline: 'b' }];
      var blockFormat = [{ block: 'div' }];
      var selectorFormat = [{ selector: 'div', classes: 'b' }];
      var selectorFormatCollapsed = [{ selector: 'div', classes: 'b', collapsed: true }];

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Expand inline format words', GeneralSteps.sequence([
          Logger.t('In middle of single word in paragraph', Chain.asStep(editor, [
            cSetRawContent('<p>ab</p>'),
            cExpandRng([0, 0], 1, [0, 0], 1, inlineFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('In middle of single word in paragraph with paragraph siblings', Chain.asStep(editor, [
            cSetRawContent('<p>a</p><p>bc</p><p>de</p>'),
            cExpandRng([1, 0], 1, [1, 0], 1, inlineFormat, false),
            cAssertRange(editor, [], 1, [], 2)
          ])),
          Logger.t('In middle of single word wrapped in b', Chain.asStep(editor, [
            cSetRawContent('<p><b>ab</b></p>'),
            cExpandRng([0, 0, 0], 1, [0, 0, 0], 1, inlineFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('In middle of first word', Chain.asStep(editor, [
            cSetRawContent('<p>ab cd</p>'),
            cExpandRng([0, 0], 1, [0, 0], 1, inlineFormat, false),
            cAssertRange(editor, [], 0, [0, 0], 2)
          ])),
          Logger.t('In middle of last word', Chain.asStep(editor, [
            cSetRawContent('<p>ab cd</p>'),
            cExpandRng([0, 0], 4, [0, 0], 4, inlineFormat, false),
            cAssertRange(editor, [0, 0], 3, [], 1)
          ])),
          Logger.t('In middle of middle word', Chain.asStep(editor, [
            cSetRawContent('<p>ab cd ef</p>'),
            cExpandRng([0, 0], 4, [0, 0], 4, inlineFormat, false),
            cAssertRange(editor, [0, 0], 3, [0, 0], 5)
          ])),
          Logger.t('In middle of word with bold siblings expand to sibling spaces', Chain.asStep(editor, [
            cSetRawContent('<p><b>ab </b>cd<b> ef</b></p>'),
            cExpandRng([0, 1], 1, [0, 1], 1, inlineFormat, false),
            cAssertRange(editor, [0, 0, 0], 3, [0, 2, 0], 0)
          ])),
          Logger.t('In middle of word with block sibling and inline sibling expand to sibling space to the right', Chain.asStep(editor, [
            cSetRawContent('<div><p>ab </p>cd<b> ef</b></div>'),
            cExpandRng([0, 1], 1, [0, 1], 1, inlineFormat, false),
            cAssertRange(editor, [0, 1], 0, [0, 2, 0], 0)
          ])),
          Logger.t('In middle of word with block sibling and inline sibling expand to sibling space to the left', Chain.asStep(editor, [
            cSetRawContent('<div><b>ab </b>cd<p> ef</p></div>'),
            cExpandRng([0, 1], 1, [0, 1], 1, inlineFormat, false),
            cAssertRange(editor, [0, 0, 0], 3, [0, 1], 2)
          ])),
          Logger.t('In middle of middle word separated by nbsp characters', Chain.asStep(editor, [
            cSetRawContent('<p>ab\u00a0cd\u00a0ef</p>'),
            cExpandRng([0, 0], 4, [0, 0], 4, inlineFormat, false),
            cAssertRange(editor, [0, 0], 3, [0, 0], 5)
          ])),
          Logger.t('In empty paragraph', Chain.asStep(editor, [
            cSetRawContent('<p><br></p>'),
            cExpandRng([0], 0, [0], 0, inlineFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('Fully selected word', Chain.asStep(editor, [
            cSetRawContent('<p>ab</p>'),
            cExpandRng([0, 0], 0, [0, 0], 2, inlineFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('Partially selected word', Chain.asStep(editor, [
            cSetRawContent('<p>abc</p>'),
            cExpandRng([0, 0], 1, [0, 0], 2, inlineFormat, false),
            cAssertRange(editor, [0, 0], 1, [0, 0], 2)
          ])),
          Logger.t('Whole word selected wrapped in multiple inlines', Chain.asStep(editor, [
            cSetRawContent('<p><b><i>c</i></b></p>'),
            cExpandRng([0, 0, 0, 0], 0, [0, 0, 0, 0], 1, inlineFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('Whole word inside td', Chain.asStep(editor, [
            cSetRawContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
            cExpandRng([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1, inlineFormat, false),
            cAssertRange(editor, [0, 0, 0], 0, [0, 0, 0], 1)
          ])),
          Logger.t('In middle of single word in paragraph (index based)', Chain.asStep(editor, [
            cSetRawContent('<p>ab</p>'),
            cExpandRng([0], 0, [0], 1, inlineFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('In middle of single word wrapped in bold in paragraph (index based)', Chain.asStep(editor, [
            cSetRawContent('<p><b>ab</b></p>'),
            cExpandRng([0], 0, [0], 1, inlineFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('In middle of word inside bookmark then exclude bookmark', Chain.asStep(editor, [
            cSetRawContent('<p><span data-mce-type="bookmark">ab cd ef</span></p>'),
            cExpandRng([0, 0, 0], 3, [0, 0, 0], 5, inlineFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ]))
        ])),

        Logger.t('Expand inline format words (remove format)', GeneralSteps.sequence([
          Logger.t('In middle of single word in paragraph', Chain.asStep(editor, [
            cSetRawContent('<p>ab</p>'),
            cExpandRng([0, 0], 1, [0, 0], 1, inlineFormat, true),
            cAssertRange(editor, [], 0, [], 1)
          ]))
        ])),

        Logger.t('Expand block format', GeneralSteps.sequence([
          Logger.t('In middle word', Chain.asStep(editor, [
            cSetRawContent('<p>ab cd ef</p>'),
            cExpandRng([0, 0], 4, [0, 0], 4, blockFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('In middle bold word', Chain.asStep(editor, [
            cSetRawContent('<p>ab <b>cd</b> ef</p>'),
            cExpandRng([0, 1, 0], 1, [0, 1, 0], 1, blockFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('Whole word inside td', Chain.asStep(editor, [
            cSetRawContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
            cExpandRng([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1, blockFormat, false),
            cAssertRange(editor, [0, 0, 0], 0, [0, 0, 0], 1)
          ]))
        ])),

        Logger.t('Expand selector format', GeneralSteps.sequence([
          Logger.t('Do not expand if selector does not match', Chain.asStep(editor, [
            cSetRawContent('<p>ab</p>'),
            cExpandRng([0, 0], 1, [0, 0], 1, selectorFormat, false),
            cAssertRange(editor, [0, 0], 1, [0, 0], 1)
          ])),
          Logger.t('Expand since selector matches', Chain.asStep(editor, [
            cSetRawContent('<div>ab</div>'),
            cExpandRng([0, 0], 1, [0, 0], 1, selectorFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('Expand since selector matches non collapsed', Chain.asStep(editor, [
            cSetRawContent('<div>ab</div>'),
            cExpandRng([0, 0], 1, [0, 0], 2, selectorFormat, false),
            cAssertRange(editor, [], 0, [], 1)
          ]))
        ])),

        Logger.t('Expand selector format with collapsed property', GeneralSteps.sequence([
          Logger.t('Expand since selector matches collapsed on collapsed format', Chain.asStep(editor, [
            cSetRawContent('<div>ab</div>'),
            cExpandRng([0, 0], 1, [0, 0], 1, selectorFormatCollapsed, false),
            cAssertRange(editor, [], 0, [], 1)
          ])),
          Logger.t('Expand since selector matches non collapsed on collapsed format', Chain.asStep(editor, [
            cSetRawContent('<div>ab</div>'),
            cExpandRng([0, 0], 1, [0, 0], 2, selectorFormatCollapsed, false),
            cAssertRange(editor, [0, 0], 1, [0, 0], 2)
          ]))
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);