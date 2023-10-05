import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Html, Insert, SugarElement } from '@ephox/sugar';

import Schema from 'tinymce/core/api/html/Schema';
import * as FragmentReader from 'tinymce/core/selection/FragmentReader';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.selection.FragmentReaderTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const readFragment = (startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
    const ec = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), endPath).getOrDie();
    const rng = document.createRange();

    rng.setStart(sc.dom, startOffset);
    rng.setEnd(ec.dom, endOffset);

    return FragmentReader.read(SugarElement.fromDom(viewBlock.get()), [ rng ], Schema());
  };

  const readFragmentCells = (paths: number[][]) => {
    const ranges = Arr.map(paths, (path) => {
      const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), path).getOrDie();
      const rng = document.createRange();
      rng.selectNode(container.dom);
      return rng;
    });

    return FragmentReader.read(SugarElement.fromDom(viewBlock.get()), ranges, Schema());
  };

  const getFragmentHtml = (fragment: SugarElement<Node>) => {
    const elm = SugarElement.fromTag('div');
    Insert.append(elm, fragment);
    return Html.get(elm);
  };

  const assertFragmentHtml = (fragment: SugarElement<Node>, expectedHtml: string) => {
    const actualHtml = getFragmentHtml(fragment);
    Assertions.assertHtml('Should be expected fragment html', expectedHtml, actualHtml);
  };

  context('Fragments on inline elements', () => {
    it('Get fragment from collapsed range', () => {
      setHtml('<p><b>abc</b></p>');
      const frag = readFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '');
    });

    it('Get fragment from partially selected text', () => {
      setHtml('<p><b>abc</b></p>');
      const frag = readFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2);
      assertFragmentHtml(frag, '<b>b</b>');
    });

    it('Get fragment from partially selected inline element', () => {
      setHtml('<p><i>a<b>b</b></i></p>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1);
      assertFragmentHtml(frag, '<i>a<b>b</b></i>');
    });

    it('Get fragment on text only inside inline element', () => {
      setHtml('<p><b>a</b></p>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<b>a</b>');
    });

    it('Get fragment on text only inside inline elements', () => {
      setHtml('<p><a href="#1"><i><b>a</b></i></a></p>');
      const frag = readFragment([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<a href="#1"><i><b>a</b></i></a>');
    });

    it('Get fragment indexed element within inline element', () => {
      setHtml('<p><b><input></b></p>');
      const frag = readFragment([ 0, 0 ], 0, [ 0, 0 ], 1);
      assertFragmentHtml(frag, '<b><input></b>');
    });
  });

  context('Fragments on headers', () => {
    it('Get fragment from partially selected text inside h1', () => {
      setHtml('<h1><b>abc</b></h1>');
      const frag = readFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2);
      assertFragmentHtml(frag, '<h1><b>b</b></h1>');
    });

    it('Get fragment text selection inside h1', () => {
      setHtml('<h1>a</h1>');
      const frag = readFragment([ 0, 0 ], 0, [ 0, 0 ], 1);
      assertFragmentHtml(frag, '<h1>a</h1>');
    });

    it('Get fragment text selection inside h2', () => {
      setHtml('<h2>a</h2>');
      const frag = readFragment([ 0, 0 ], 0, [ 0, 0 ], 1);
      assertFragmentHtml(frag, '<h2>a</h2>');
    });

    it('Get fragment from text selection inside inline element inside h1', () => {
      setHtml('<h1><b>a</b></h1>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<h1><b>a</b></h1>');
    });

    it('Get fragment from text inside a bunch of inline elements inside a h1', () => {
      setHtml('<h1><a href="#1"><i><b>b</b></i></a></h1>');
      const frag = readFragment([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<h1><a href="#1"><i><b>b</b></i></a></h1>');
    });
  });

  context('Fragments on li', () => {
    it('Get fragment from fully selected li contents text in ul', () => {
      setHtml('<ul><li>a</li></ul>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<ul><li>a</li></ul>');
    });

    it('Get fragment from fully selected li contents text in ol', () => {
      setHtml('<ol><li>a</li></ol>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<ol><li>a</li></ol>');
    });

    it('Get fragment from fully selected li contents text in ul with list style', () => {
      setHtml('<ul style="list-style-type: circle;"><li>a</li></ul>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<ul style="list-style-type: circle;"><li>a</li></ul>');
    });

    it('Get fragment from fully selected li contents text in ol with list style', () => {
      setHtml('<ol style="list-style-type: upper-roman;"><li>a</li></ol>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<ol style="list-style-type: upper-roman;"><li>a</li></ol>');
    });

    it('Get fragment from fully selected li contents text in ul in ol', () => {
      setHtml('<ol><li><ul><li>a</li></ul></li></ol>');
      const frag = readFragment([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<ul><li>a</li></ul>');
    });

    it('Get fragment from fully selected li mixed contents in ol', () => {
      setHtml('<ol><li>a<b>b</b></li></ol>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1);
      assertFragmentHtml(frag, '<ol><li>a<b>b</b></li></ol>');
    });

    it('Get fragment from fully selected li mixed contents in ul', () => {
      setHtml('<ul><li><b>a</b><b>b</b></li></ul>');
      const frag = readFragment([ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1);
      assertFragmentHtml(frag, '<ul><li><b>a</b><b>b</b></li></ul>');
    });

    it('Get fragment from fully selected li contents with siblings', () => {
      setHtml('<ul><li>a</li><li>b</li><li>c</li></ul>');
      const frag = readFragment([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 1);
      assertFragmentHtml(frag, '<ul><li>b</li></ul>');
    });

    it('Get fragment from partially selected li contents (start)', () => {
      setHtml('<ul><li>abc</li></ul>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
      assertFragmentHtml(frag, 'ab');
    });

    it('Get fragment from partially selected li contents (middle)', () => {
      setHtml('<ul><li>abc</li></ul>');
      const frag = readFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2);
      assertFragmentHtml(frag, 'b');
    });

    it('Get fragment from partially selected li contents (end)', () => {
      setHtml('<ul><li>abc</li></ul>');
      const frag = readFragment([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3);
      assertFragmentHtml(frag, 'bc');
    });

    it('Get fragment from fully selected li contents text in ul with trailing br', () => {
      setHtml('<ul><li>a<br></li></ul>');
      const frag = readFragment([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<ul><li>a</li></ul>');
    });

    it('Get fragment from fully selected inline element contents text in ul with trailing br', () => {
      setHtml('<ul><li><b>a<br></b></li></ul>');
      const frag = readFragment([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);
      assertFragmentHtml(frag, '<ul><li><b>a</b></li></ul>');
    });

    it('Get fragment from two partially selected li:s', () => {
      setHtml('<ol><li>ab</li><li>cd</li></ol>');
      const frag = readFragment([ 0, 0, 0 ], 1, [ 0, 1, 0 ], 1);
      assertFragmentHtml(frag, '<ol><li>b</li><li>c</li></ol>');
    });

    it('Get fragment from two partially selected li:s in nested structure', () => {
      setHtml('<ol><li>ab<ol><li>cd</li></ol></li></ol>');
      const frag = readFragment([ 0, 0, 0 ], 1, [ 0, 0, 1, 0, 0 ], 1);
      assertFragmentHtml(frag, '<ol><li>b<ol><li>c</li></ol></li></ol>');
    });
  });

  context('Fragments from tables', () => {
    it('Get table fragment from table 2x2 with selection (1,1)-(1,2)', () => {
      setHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td>B</td></tr><tr><td data-mce-selected="1">C</td><td>D</td></tr></tbody></table>');
      const frag = readFragment([ 0 ], 0, [ 0 ], 1);
      assertFragmentHtml(frag, '<table><tbody><tr><td data-mce-selected="1">A</td></tr><tr><td data-mce-selected="1">C</td></tr></tbody></table>');
    });

    it('Get table fragment from table 2x2 with selection (1,1)-(2,1)', () => {
      setHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td data-mce-selected="1">B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
      const frag = readFragment([ 0 ], 0, [ 0 ], 1);
      assertFragmentHtml(frag, '<table><tbody><tr><td data-mce-selected="1">A</td><td data-mce-selected="1">B</td></tr></tbody></table>');
    });

    it('Get table fragment from table 2x2 with multi range selection (1,1)-(2,2)', () => {
      setHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
      const frag = readFragmentCells([[ 0, 0, 0, 0 ], [ 0, 0, 1, 1 ]]);
      assertFragmentHtml(frag, '<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
    });

    it('Get table fragment from table 2x2 with multi range selection (2,1)-(2,2)', () => {
      setHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>');
      const frag = readFragmentCells([[ 0, 0, 0, 1 ], [ 0, 0, 1, 1 ]]);
      assertFragmentHtml(frag, '<table><tbody><tr><td>B</td></tr><tr><td>D</td></tr></tbody></table>');
    });
  });
});
