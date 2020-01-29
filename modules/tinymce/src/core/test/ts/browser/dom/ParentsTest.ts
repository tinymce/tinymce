import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Element, Node } from '@ephox/sugar';
import Parents from 'tinymce/core/dom/Parents';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.dom.ParentsTest', function (success, failure) {

  const cCreateStructure = function (html) {
    return Chain.injectThunked(function () {
      return Element.fromHtml(html);
    });
  };

  const cParentsUntil = function (startPath, rootPath, predicate) {
    return Chain.mapper(function (structure: any) {
      const startNode = Hierarchy.follow(structure, startPath).getOrDie();
      const rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
      return Parents.parentsUntil(startNode, rootNode, predicate);
    });
  };

  const cParents = function (startPath, rootPath) {
    return Chain.mapper(function (structure: any) {
      const startNode = Hierarchy.follow(structure, startPath).getOrDie();
      const rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
      return Parents.parents(startNode, rootNode);
    });
  };

  const cParentsAndSelf = function (startPath, rootPath) {
    return Chain.mapper(function (structure: any) {
      const startNode = Hierarchy.follow(structure, startPath).getOrDie();
      const rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
      return Parents.parentsAndSelf(startNode, rootNode);
    });
  };

  const cAssertElementNames = function (expectedNames) {
    return Chain.mapper(function (parents: Element[]) {
      const names = Arr.map(parents, Node.name);
      Assertions.assertEq('Should be expected names', expectedNames, names);
      return {};
    });
  };

  const hasName = function (name) {
    return function (elm) {
      return Node.name(elm) === name;
    };
  };

  Pipeline.async({}, [
    Logger.t('parentsUntil', GeneralSteps.sequence([
      Logger.t('parentsUntil root', Chain.asStep({}, [
        cCreateStructure('<p><b>a</b></p>'),
        cParentsUntil([0, 0], [], hasName('p')),
        cAssertElementNames(['b'])
      ])),

      Logger.t('parentsUntil root on elm', Chain.asStep({}, [
        cCreateStructure('<p><b><i></i></b></p>'),
        cParentsUntil([0, 0], [], hasName('p')),
        cAssertElementNames(['b'])
      ])),

      Logger.t('parentsUntil root deeper', Chain.asStep({}, [
        cCreateStructure('<p><b><i><u>a</u></i></b></p>'),
        cParentsUntil([0, 0, 0, 0], [], hasName('p')),
        cAssertElementNames(['u', 'i', 'b'])
      ])),

      Logger.t('parentsUntil end at b', Chain.asStep({}, [
        cCreateStructure('<p><b><i><u>a</u></i></b></p>'),
        cParentsUntil([0, 0, 0, 0], [], hasName('b')),
        cAssertElementNames(['u', 'i'])
      ])),

      Logger.t('parentsUntil end at b', Chain.asStep({}, [
        cCreateStructure('<p><b>a</b></p>'),
        cParentsUntil([0, 0], [], hasName('b')),
        cAssertElementNames([])
      ])),

      Logger.t('parentsUntil root scope', Chain.asStep({}, [
        cCreateStructure('<p><b><i><u>a</u></i></b></p>'),
        cParentsUntil([0, 0, 0, 0], [0], hasName('p')),
        cAssertElementNames(['u', 'i'])
      ]))
    ])),

    Logger.t('parents', GeneralSteps.sequence([
      Logger.t('parents', Chain.asStep({}, [
        cCreateStructure('<p><b><i><u>a</u></i></b></p>'),
        cParents([0, 0, 0, 0], []),
        cAssertElementNames(['u', 'i', 'b'])
      ])),

      Logger.t('parents scoped', Chain.asStep({}, [
        cCreateStructure('<p><b><i><u>a</u></i></b></p>'),
        cParents([0, 0, 0, 0], [0]),
        cAssertElementNames(['u', 'i'])
      ]))
    ])),

    Logger.t('parentsAndSelf', GeneralSteps.sequence([
      Logger.t('parentsAndSelf', Chain.asStep({}, [
        cCreateStructure('<p><b><i><u>a</u></i></b></p>'),
        cParentsAndSelf([0, 0, 0, 0], []),
        cAssertElementNames(['#text', 'u', 'i', 'b'])
      ])),

      Logger.t('parentsAndSelf scoped', Chain.asStep({}, [
        cCreateStructure('<p><b><i><u>a</u></i></b></p>'),
        cParentsAndSelf([0, 0, 0, 0], [0]),
        cAssertElementNames(['#text', 'u', 'i'])
      ]))
    ]))
  ], function () {
    success();
  }, failure);
});
