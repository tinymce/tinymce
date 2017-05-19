asynctest(
  'browser.tinymce.core.selection.FragmentReaderTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'tinymce.core.selection.FragmentReader',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Fun, Hierarchy, Insert, Element, Html, FragmentReader, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = ViewBlock();

    var cSetHtml = function (html) {
      return Chain.op(function () {
        viewBlock.update(html);
      });
    };

    var cReadFragment = function (startPath, startOffset, endPath, endOffset) {
      return Chain.mapper(function (viewBlock) {
        var sc = Hierarchy.follow(Element.fromDom(viewBlock.get()), startPath).getOrDie();
        var ec = Hierarchy.follow(Element.fromDom(viewBlock.get()), endPath).getOrDie();
        var rng = document.createRange();

        rng.setStart(sc.dom(), startOffset);
        rng.setEnd(ec.dom(), endOffset);

        return FragmentReader.read(viewBlock.get(), rng);
      });
    };

    var getFragmentHtml = function (fragment) {
      var elm = Element.fromTag('div');
      Insert.append(elm, fragment);
      return Html.get(elm);
    };

    var cAssertFragmentHtml = function (expectedHtml) {
      return Chain.mapper(function (fragment) {
        var actualHtml = getFragmentHtml(fragment);
        Assertions.assertHtml('Should be expected fragment html', expectedHtml, actualHtml);
        return fragment;
      });
    };

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('Fragments on inline elements', GeneralSteps.sequence([
        Logger.t('Get fragment from collapsed range', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>abc</b></p>'),
          cReadFragment([0, 0, 0], 1, [0, 0, 0], 1),
          cAssertFragmentHtml('')
        ])),
        Logger.t('Get fragment from partially selected text', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>abc</b></p>'),
          cReadFragment([0, 0, 0], 1, [0, 0, 0], 2),
          cAssertFragmentHtml('<b>b</b>')
        ])),
        Logger.t('Get fragment from partially selected inline element', Chain.asStep(viewBlock, [
          cSetHtml('<p><i>a<b>b</b></i></p>'),
          cReadFragment([0, 0, 0], 0, [0, 0, 1, 0], 1),
          cAssertFragmentHtml('<i>a<b>b</b></i>')
        ])),
        Logger.t('Get fragment on text only inside inline element', Chain.asStep(viewBlock, [
          cSetHtml('<p><b>a</b></p>'),
          cReadFragment([0, 0, 0], 0, [0, 0, 0], 1),
          cAssertFragmentHtml('<b>a</b>')
        ])),
        Logger.t('Get fragment on text only inside inline elements', Chain.asStep(viewBlock, [
          cSetHtml('<p><a href="#1"><i><b>a</b></i></a></p>'),
          cReadFragment([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
          cAssertFragmentHtml('<a href="#1"><i><b>a</b></i></a>')
        ])),
        Logger.t('Get fragment indexed element within inline element', Chain.asStep(viewBlock, [
          cSetHtml('<p><b><input></b></p>'),
          cReadFragment([0, 0], 0, [0, 0], 1),
          cAssertFragmentHtml('<b><input></b>')
        ]))
      ])),
      Logger.t('Fragments on headers', GeneralSteps.sequence([
        Logger.t('Get fragment from partially selected text inside h1', Chain.asStep(viewBlock, [
          cSetHtml('<h1><b>abc</b></h1>'),
          cReadFragment([0, 0, 0], 1, [0, 0, 0], 2),
          cAssertFragmentHtml('<h1><b>b</b></h1>')
        ])),
        Logger.t('Get fragment text selection inside h1', Chain.asStep(viewBlock, [
          cSetHtml('<h1>a</h1>'),
          cReadFragment([0, 0], 0, [0, 0], 1),
          cAssertFragmentHtml('<h1>a</h1>')
        ])),
        Logger.t('Get fragment text selection inside h2', Chain.asStep(viewBlock, [
          cSetHtml('<h2>a</h2>'),
          cReadFragment([0, 0], 0, [0, 0], 1),
          cAssertFragmentHtml('<h2>a</h2>')
        ])),
        Logger.t('Get fragment from text selection inside inline element inside h1', Chain.asStep(viewBlock, [
          cSetHtml('<h1><b>a</b></h1>'),
          cReadFragment([0, 0, 0], 0, [0, 0, 0], 1),
          cAssertFragmentHtml('<h1><b>a</b></h1>')
        ])),
        Logger.t('Get fragment from text inside a bunch of inline elements inside a h1', Chain.asStep(viewBlock, [
          cSetHtml('<h1><a href="#1"><i><b>b</b></i></a></h1>'),
          cReadFragment([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
          cAssertFragmentHtml('<h1><a href="#1"><i><b>b</b></i></a></h1>')
        ]))
      ])),
      Logger.t('Fragments on li', GeneralSteps.sequence([
        Logger.t('Get fragment from fully selected li contents text in ul', Chain.asStep(viewBlock, [
          cSetHtml('<ul><li>a</li></ul>'),
          cReadFragment([0, 0, 0], 0, [0, 0, 0], 1),
          cAssertFragmentHtml('<ul><li>a</li></ul>')
        ])),
        Logger.t('Get fragment from fully selected li contents text in ol', Chain.asStep(viewBlock, [
          cSetHtml('<ol><li>a</li></ol>'),
          cReadFragment([0, 0, 0], 0, [0, 0, 0], 1),
          cAssertFragmentHtml('<ol><li>a</li></ol>')
        ])),
        Logger.t('Get fragment from fully selected li contents text in ul in ol', Chain.asStep(viewBlock, [
          cSetHtml('<ol><li><ul><li>a</li></ul></li></ol>'),
          cReadFragment([0, 0, 0, 0], 0, [0, 0, 0, 0], 1),
          cAssertFragmentHtml('<ul><li>a</li></ul>')
        ])),
        Logger.t('Get fragment from fully selected li mixed contents in ol', Chain.asStep(viewBlock, [
          cSetHtml('<ol><li>a<b>b</b></li></ol>'),
          cReadFragment([0, 0, 0], 0, [0, 0, 1, 0], 1),
          cAssertFragmentHtml('<ol><li>a<b>b</b></li></ol>')
        ])),
        Logger.t('Get fragment from fully selected li mixed contents in ul', Chain.asStep(viewBlock, [
          cSetHtml('<ul><li><b>a</b><b>b</b></li></ul>'),
          cReadFragment([0, 0, 0, 0], 0, [0, 0, 1, 0], 1),
          cAssertFragmentHtml('<ul><li><b>a</b><b>b</b></li></ul>')
        ])),
        Logger.t('Get fragment from fully selected li contents with siblings', Chain.asStep(viewBlock, [
          cSetHtml('<ul><li>a</li><li>b</li><li>c</li></ul>'),
          cReadFragment([0, 1, 0], 0, [0, 1, 0], 1),
          cAssertFragmentHtml('<ul><li>b</li></ul>')
        ])),
        Logger.t('Get fragment from partially selected li contents (start)', Chain.asStep(viewBlock, [
          cSetHtml('<ul><li>abc</li></ul>'),
          cReadFragment([0, 0, 0], 0, [0, 0, 0], 2),
          cAssertFragmentHtml('ab')
        ])),
        Logger.t('Get fragment from partially selected li contents (middle)', Chain.asStep(viewBlock, [
          cSetHtml('<ul><li>abc</li></ul>'),
          cReadFragment([0, 0, 0], 1, [0, 0, 0], 2),
          cAssertFragmentHtml('b')
        ])),
        Logger.t('Get fragment from partially selected li contents (end)', Chain.asStep(viewBlock, [
          cSetHtml('<ul><li>abc</li></ul>'),
          cReadFragment([0, 0, 0], 1, [0, 0, 0], 3),
          cAssertFragmentHtml('bc')
        ])),
        Logger.t('Get fragment from fully selected li contents text in ul with traling br', Chain.asStep(viewBlock, [
          cSetHtml('<ul><li>a<br></li></ul>'),
          cReadFragment([0, 0, 0], 0, [0, 0, 0], 1),
          cAssertFragmentHtml('<ul><li>a</li></ul>')
        ])),
        Logger.t('Get fragment from fully selected li contents text in ul with traling br', Chain.asStep(viewBlock, [
          cSetHtml('<ul><li><b>a<br></b></li></ul>'),
          cReadFragment([0, 0, 0, 0], 0, [0, 0, 0, 0], 1),
          cAssertFragmentHtml('<ul><li><b>a</b></li></ul>')
        ]))
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);