asynctest(
  'browser.tinymce.core.dom.ParentsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'tinymce.core.dom.Parents'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, Arr, Hierarchy, Insert, Element, Node, Parents) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var cCreateStructure = function (html) {
      return Chain.mapper(function (_) {
        return Element.fromHtml(html);
      });
    };

    var cParentsUntil = function (startPath, rootPath, predicate) {
      return Chain.mapper(function (structure) {
        var startNode = Hierarchy.follow(structure, startPath).getOrDie();
        var rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
        return Parents.parentsUntil(startNode, rootNode, predicate);
      });
    };

    var cParents = function (startPath, rootPath) {
      return Chain.mapper(function (structure) {
        var startNode = Hierarchy.follow(structure, startPath).getOrDie();
        var rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
        return Parents.parents(startNode, rootNode);
      });
    };

    var cParentsAndSelf = function (startPath, rootPath) {
      return Chain.mapper(function (structure) {
        var startNode = Hierarchy.follow(structure, startPath).getOrDie();
        var rootNode = Hierarchy.follow(structure, rootPath).getOrDie();
        return Parents.parentsAndSelf(startNode, rootNode);
      });
    };

    var cAssertElementNames = function (expectedNames) {
      return Chain.mapper(function (parents) {
        var names = Arr.map(parents, Node.name);
        Assertions.assertEq('Should be expected names', expectedNames, names);
        return {};
      });
    };

    var hasName = function (name) {
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
  }
);
