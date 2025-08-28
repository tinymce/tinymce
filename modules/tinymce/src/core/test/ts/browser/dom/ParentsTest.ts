import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import * as Parents from 'tinymce/core/dom/Parents';

describe('browser.tinymce.core.dom.ParentsTest', () => {
  const createStructure = (html: string) => SugarElement.fromHtml(html);

  const parentsUntil = (structure: SugarElement, startPath: number[], rootPath: number[], predicate: (elm: SugarElement) => boolean) => {
    const startNode = Hierarchy.follow(structure, startPath).getOrDie();
    const rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
    return Parents.parentsUntil(startNode, rootNode, predicate);
  };

  const parents = (structure: SugarElement, startPath: number[], rootPath: number[]) => {
    const startNode = Hierarchy.follow(structure, startPath).getOrDie();
    const rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
    return Parents.parents(startNode, rootNode);
  };

  const parentsAndSelf = (structure: SugarElement, startPath: number[], rootPath: number[]) => {
    const startNode = Hierarchy.follow(structure, startPath).getOrDie();
    const rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
    return Parents.parentsAndSelf(startNode, rootNode);
  };

  const assertElementNames = (parents: SugarElement[], expectedNames: string[]) => {
    const names = Arr.map(parents, SugarNode.name);
    assert.deepEqual(names, expectedNames, 'Should be expected names');
  };

  context('parentsUntil', () => {
    it('parentsUntil root', () => {
      const structure = createStructure('<p><b>a</b></p>');
      const parentElms = parentsUntil(structure, [ 0, 0 ], [], SugarNode.isTag('p'));
      assertElementNames(parentElms, [ 'b' ]);
    });

    it('parentsUntil root on elm', () => {
      const structure = createStructure('<p><b><i></i></b></p>');
      const parentElms = parentsUntil(structure, [ 0, 0 ], [], SugarNode.isTag('p'));
      assertElementNames(parentElms, [ 'b' ]);
    });

    it('parentsUntil root deeper', () => {
      const structure = createStructure('<p><b><i><u>a</u></i></b></p>');
      const parentElms = parentsUntil(structure, [ 0, 0, 0, 0 ], [], SugarNode.isTag('p'));
      assertElementNames(parentElms, [ 'u', 'i', 'b' ]);
    });

    it('parentsUntil end at b with nested inline elements', () => {
      const structure = createStructure('<p><b><i><u>a</u></i></b></p>');
      const parentElms = parentsUntil(structure, [ 0, 0, 0, 0 ], [], SugarNode.isTag('b'));
      assertElementNames(parentElms, [ 'u', 'i' ]);
    });

    it('parentsUntil end at b', () => {
      const structure = createStructure('<p><b>a</b></p>');
      const parentElms = parentsUntil(structure, [ 0, 0 ], [], SugarNode.isTag('b'));
      assertElementNames(parentElms, []);
    });

    it('parentsUntil root scope', () => {
      const structure = createStructure('<p><b><i><u>a</u></i></b></p>');
      const parentElms = parentsUntil(structure, [ 0, 0, 0, 0 ], [ 0 ], SugarNode.isTag('p'));
      assertElementNames(parentElms, [ 'u', 'i' ]);
    });
  });

  context('parents', () => {
    it('parents', () => {
      const structure = createStructure('<p><b><i><u>a</u></i></b></p>');
      const parentElms = parents(structure, [ 0, 0, 0, 0 ], []);
      assertElementNames(parentElms, [ 'u', 'i', 'b' ]);
    });

    it('parents scoped', () => {
      const structure = createStructure('<p><b><i><u>a</u></i></b></p>');
      const parentElms = parents(structure, [ 0, 0, 0, 0 ], [ 0 ]);
      assertElementNames(parentElms, [ 'u', 'i' ]);
    });
  });

  context('parentsAndSelf', () => {
    it('parentsAndSelf', () => {
      const structure = createStructure('<p><b><i><u>a</u></i></b></p>');
      const parentElms = parentsAndSelf(structure, [ 0, 0, 0, 0 ], []);
      assertElementNames(parentElms, [ '#text', 'u', 'i', 'b' ]);
    });

    it('parentsAndSelf scoped', () => {
      const structure = createStructure('<p><b><i><u>a</u></i></b></p>');
      const parentElms = parentsAndSelf(structure, [ 0, 0, 0, 0 ], [ 0 ]);
      assertElementNames(parentElms, [ '#text', 'u', 'i' ]);
    });
  });
});
