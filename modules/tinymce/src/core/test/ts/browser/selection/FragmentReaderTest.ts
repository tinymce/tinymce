import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Element, Hierarchy, Html, Insert } from '@ephox/sugar';
import * as FragmentReader from 'tinymce/core/selection/FragmentReader';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.selection.FragmentReaderTest', function (success, failure) {
  const viewBlock = ViewBlock();

  const cSetHtml = function (html) {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  const cReadFragment = function (startPath, startOffset, endPath, endOffset) {
    return Chain.mapper(function (viewBlock: any) {
      const sc = Hierarchy.follow(Element.fromDom(viewBlock.get()), startPath).getOrDie();
      const ec = Hierarchy.follow(Element.fromDom(viewBlock.get()), endPath).getOrDie();
      const rng = document.createRange();

      rng.setStart(sc.dom(), startOffset);
      rng.setEnd(ec.dom(), endOffset);

      return FragmentReader.read(Element.fromDom(viewBlock.get()), [ rng ]);
    });
  };

  const cReadFragmentCells = function (paths) {
    return Chain.mapper(function (viewBlock: any) {
      const ranges = Arr.map(paths, function (path) {
        const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
        const rng = document.createRange();
        rng.selectNode(container.dom());
        return rng;
      });

      return FragmentReader.read(Element.fromDom(viewBlock.get()), ranges);
    });
  };

  const getFragmentHtml = function (fragment) {
    const elm = Element.fromTag('div');
    Insert.append(elm, fragment);
    return Html.get(elm);
  };

  const cAssertFragmentHtml = function (expectedHtml) {
    return Chain.mapper(function (fragment) {
      const actualHtml = getFragmentHtml(fragment);
      Assertions.assertHtml('Should be expected fragment html', expectedHtml, actualHtml);
      return fragment;
    });
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('Fragments on inline elements', GeneralSteps.sequence([
      Logger.t('Get fragment from collapsed range', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>abc</b></p>'),
        cReadFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1),
        cAssertFragmentHtml('')
      ])),
      Logger.t('Get fragment from partially selected text', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>abc</b></p>'),
        cReadFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2),
        cAssertFragmentHtml('<b>b</b>')
      ])),
      Logger.t('Get fragment from partially selected inline element', Chain.asStep(viewBlock, [
        cSetHtml('<p><i>a<b>b</b></i></p>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1),
        cAssertFragmentHtml('<i>a<b>b</b></i>')
      ])),
      Logger.t('Get fragment on text only inside inline element', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b></p>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1),
        cAssertFragmentHtml('<b>a</b>')
      ])),
      Logger.t('Get fragment on text only inside inline elements', Chain.asStep(viewBlock, [
        cSetHtml('<p><a href="#1"><i><b>a</b></i></a></p>'),
        cReadFragment([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
        cAssertFragmentHtml('<a href="#1"><i><b>a</b></i></a>')
      ])),
      Logger.t('Get fragment indexed element within inline element', Chain.asStep(viewBlock, [
        cSetHtml('<p><b><input></b></p>'),
        cReadFragment([ 0, 0 ], 0, [ 0, 0 ], 1),
        cAssertFragmentHtml('<b><input></b>')
      ]))
    ])),
    Logger.t('Fragments on headers', GeneralSteps.sequence([
      Logger.t('Get fragment from partially selected text inside h1', Chain.asStep(viewBlock, [
        cSetHtml('<h1><b>abc</b></h1>'),
        cReadFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2),
        cAssertFragmentHtml('<h1><b>b</b></h1>')
      ])),
      Logger.t('Get fragment text selection inside h1', Chain.asStep(viewBlock, [
        cSetHtml('<h1>a</h1>'),
        cReadFragment([ 0, 0 ], 0, [ 0, 0 ], 1),
        cAssertFragmentHtml('<h1>a</h1>')
      ])),
      Logger.t('Get fragment text selection inside h2', Chain.asStep(viewBlock, [
        cSetHtml('<h2>a</h2>'),
        cReadFragment([ 0, 0 ], 0, [ 0, 0 ], 1),
        cAssertFragmentHtml('<h2>a</h2>')
      ])),
      Logger.t('Get fragment from text selection inside inline element inside h1', Chain.asStep(viewBlock, [
        cSetHtml('<h1><b>a</b></h1>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1),
        cAssertFragmentHtml('<h1><b>a</b></h1>')
      ])),
      Logger.t('Get fragment from text inside a bunch of inline elements inside a h1', Chain.asStep(viewBlock, [
        cSetHtml('<h1><a href="#1"><i><b>b</b></i></a></h1>'),
        cReadFragment([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
        cAssertFragmentHtml('<h1><a href="#1"><i><b>b</b></i></a></h1>')
      ]))
    ])),
    Logger.t('Fragments on li', GeneralSteps.sequence([
      Logger.t('Get fragment from fully selected li contents text in ul', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>a</li></ul>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1),
        cAssertFragmentHtml('<ul><li>a</li></ul>')
      ])),
      Logger.t('Get fragment from fully selected li contents text in ol', Chain.asStep(viewBlock, [
        cSetHtml('<ol><li>a</li></ol>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1),
        cAssertFragmentHtml('<ol><li>a</li></ol>')
      ])),
      Logger.t('Get fragment from fully selected li contents text in ul with list style', Chain.asStep(viewBlock, [
        cSetHtml('<ul style="list-style-type: circle;"><li>a</li></ul>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1),
        cAssertFragmentHtml('<ul style="list-style-type: circle;"><li>a</li></ul>')
      ])),
      Logger.t('Get fragment from fully selected li contents text in ol with list style', Chain.asStep(viewBlock, [
        cSetHtml('<ol style="list-style-type: upper-roman;"><li>a</li></ol>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1),
        cAssertFragmentHtml('<ol style="list-style-type: upper-roman;"><li>a</li></ol>')
      ])),
      Logger.t('Get fragment from fully selected li contents text in ul in ol', Chain.asStep(viewBlock, [
        cSetHtml('<ol><li><ul><li>a</li></ul></li></ol>'),
        cReadFragment([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1),
        cAssertFragmentHtml('<ul><li>a</li></ul>')
      ])),
      Logger.t('Get fragment from fully selected li mixed contents in ol', Chain.asStep(viewBlock, [
        cSetHtml('<ol><li>a<b>b</b></li></ol>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1),
        cAssertFragmentHtml('<ol><li>a<b>b</b></li></ol>')
      ])),
      Logger.t('Get fragment from fully selected li mixed contents in ul', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li><b>a</b><b>b</b></li></ul>'),
        cReadFragment([ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1),
        cAssertFragmentHtml('<ul><li><b>a</b><b>b</b></li></ul>')
      ])),
      Logger.t('Get fragment from fully selected li contents with siblings', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>a</li><li>b</li><li>c</li></ul>'),
        cReadFragment([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 1),
        cAssertFragmentHtml('<ul><li>b</li></ul>')
      ])),
      Logger.t('Get fragment from partially selected li contents (start)', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>abc</li></ul>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2),
        cAssertFragmentHtml('ab')
      ])),
      Logger.t('Get fragment from partially selected li contents (middle)', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>abc</li></ul>'),
        cReadFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2),
        cAssertFragmentHtml('b')
      ])),
      Logger.t('Get fragment from partially selected li contents (end)', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>abc</li></ul>'),
        cReadFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3),
        cAssertFragmentHtml('bc')
      ])),
      Logger.t('Get fragment from fully selected li contents text in ul with traling br', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li>a<br></li></ul>'),
        cReadFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1),
        cAssertFragmentHtml('<ul><li>a</li></ul>')
      ])),
      Logger.t('Get fragment from fully selected li contents text in ul with traling br', Chain.asStep(viewBlock, [
        cSetHtml('<ul><li><b>a<br></b></li></ul>'),
        cReadFragment([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1),
        cAssertFragmentHtml('<ul><li><b>a</b></li></ul>')
      ])),
      Logger.t('Get fragment from two partially selected li:s', Chain.asStep(viewBlock, [
        cSetHtml('<ol><li>ab</li><li>cd</li></ol>'),
        cReadFragment([ 0, 0, 0 ], 1, [ 0, 1, 0 ], 1),
        cAssertFragmentHtml('<ol><li>b</li><li>c</li></ol>')
      ])),
      Logger.t('Get fragment from two partially selected li:s in nested structure', Chain.asStep(viewBlock, [
        cSetHtml('<ol><li>ab<ol><li>cd</li></ol></li></ol>'),
        cReadFragment([ 0, 0, 0 ], 1, [ 0, 0, 1, 0, 0 ], 1),
        cAssertFragmentHtml('<ol><li>b<ol><li>c</li></ol></li></ol>')
      ]))
    ])),
    Logger.t('Fragments from tables', GeneralSteps.sequence([
      Logger.t('Get table fragment from table 2x2 with selection (1,1)-(1,2)', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td>B</td></tr><tr><td data-mce-selected="1">C</td><td>D</td></tr></tbody></table>'),
        cReadFragment([ 0 ], 0, [ 0 ], 1),
        cAssertFragmentHtml('<table><tbody><tr><td data-mce-selected="1">A</td></tr><tr><td data-mce-selected="1">C</td></tr></tbody></table>')
      ])),
      Logger.t('Get table fragment from table 2x2 with selection (1,1)-(2,1)', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td data-mce-selected="1">B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>'),
        cReadFragment([ 0 ], 0, [ 0 ], 1),
        cAssertFragmentHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td data-mce-selected="1">B</td></tr></tbody></table>')
      ])),
      Logger.t('Get table fragment from table 2x2 with multi range selection (1,1)-(2,2)', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>'),
        cReadFragmentCells([[ 0, 0, 0, 0 ], [ 0, 0, 1, 1 ]]),
        cAssertFragmentHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>')
      ])),
      Logger.t('Get table fragment from table 2x2 with multi range selection (2,1)-(2,2)', Chain.asStep(viewBlock, [
        cSetHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>'),
        cReadFragmentCells([[ 0, 0, 0, 1 ], [ 0, 0, 1, 1 ]]),
        cAssertFragmentHtml('<table><tbody><tr><td>B</td></tr><tr><td>D</td></tr></tbody></table>')
      ]))
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
