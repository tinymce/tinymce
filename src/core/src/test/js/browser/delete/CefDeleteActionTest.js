asynctest(
  'browser.tinymce.core.delete.CefDeleteActionTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.CefDeleteAction',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, Fun, Hierarchy, Element, CefDeleteAction, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = ViewBlock();

    var cSetHtml = function (html) {
      return Chain.op(function () {
        viewBlock.update(html);
      });
    };

    var cReadAction = function (forward, cursorPath, cursorOffset) {
      return Chain.mapper(function (viewBlock) {
        var container = Hierarchy.follow(Element.fromDom(viewBlock.get()), cursorPath).getOrDie();
        var rng = document.createRange();
        rng.setStart(container.dom(), cursorOffset);
        rng.setEnd(container.dom(), cursorOffset);
        return CefDeleteAction.read(viewBlock.get(), forward, rng);
      });
    };

    var cAssertRemoveElementAction = function (elementPath) {
      return Chain.op(function (actionOption) {
        var element = Hierarchy.follow(Element.fromDom(viewBlock.get()), elementPath).getOrDie();
        var action = actionOption.getOrDie();
        Assertions.assertEq('Should be expected action type', 'remove', actionName(action));
        Assertions.assertDomEq('Should be expected element', element, actionValue(action));
      });
    };

    var cAssertMoveToElementAction = function (elementPath) {
      return Chain.op(function (actionOption) {
        var element = Hierarchy.follow(Element.fromDom(viewBlock.get()), elementPath).getOrDie();
        var action = actionOption.getOrDie();
        Assertions.assertEq('Should be expected action type', 'moveToElement', actionName(action));
        Assertions.assertDomEq('Should be expected element', element, actionValue(action));
      });
    };

    var cAssertMoveToPositionAction = function (elementPath, offset) {
      return Chain.op(function (actionOption) {
        var container = Hierarchy.follow(Element.fromDom(viewBlock.get()), elementPath).getOrDie();
        var action = actionOption.getOrDie();
        Assertions.assertEq('Should be expected action type', 'moveToPosition', actionName(action));
        Assertions.assertDomEq('Should be expected container', container, Element.fromDom(actionValue(action).container()));
        Assertions.assertEq('Should be expected offset', offset, actionValue(action).offset());
      });
    };

    var cAssertActionNone = Chain.op(function (actionOption) {
      Assertions.assertEq('Action value should be none', true, actionOption.isNone());
    });

    var actionName = function (action) {
      return action.fold(
        Fun.constant('remove'),
        Fun.constant('moveToElement'),
        Fun.constant('moveToPosition')
      );
    };

    var actionValue = function (action) {
      return action.fold(
        Element.fromDom,
        Element.fromDom,
        Fun.identity
      );
    };

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('None actions where caret is not near a cef element', GeneralSteps.sequence([
        Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cReadAction(true, [0, 0], 0),
          cAssertActionNone
        ])),
        Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cReadAction(false, [0, 0], 0),
          cAssertActionNone
        ])),
        Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cReadAction(true, [0, 0], 1),
          cAssertActionNone
        ])),
        Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cReadAction(false, [0, 0], 1),
          cAssertActionNone
        ])),
        Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p contenteditable="false">b</p>'),
          cReadAction(true, [0, 0], 0),
          cAssertActionNone
        ])),
        Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p contenteditable="false">b</p>'),
          cReadAction(false, [0, 0], 0),
          cAssertActionNone
        ])),
        Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p>b</p>'),
          cReadAction(true, [1, 0], 1),
          cAssertActionNone
        ])),
        Logger.t('Should be no action since it not next to ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p>b</p>'),
          cReadAction(false, [1, 0], 1),
          cAssertActionNone
        ])),
        Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
          cReadAction(true, [], 2),
          cAssertActionNone
        ])),
        Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
          cReadAction(false, [], 0),
          cAssertActionNone
        ]))
      ])),

      Logger.t('MoveToElement actions where caret is near a cef element', GeneralSteps.sequence([
        Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p contenteditable="false">b</p>'),
          cReadAction(true, [0, 0], 1),
          cAssertMoveToElementAction([1])
        ])),
        Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">b</p><p>a</p>'),
          cReadAction(false, [1, 0], 0),
          cAssertMoveToElementAction([0])
        ])),
        Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p><em>a</em></p><p contenteditable="false">b</p>'),
          cReadAction(true, [0, 0, 0], 1),
          cAssertMoveToElementAction([1])
        ])),
        Logger.t('Should be moveToElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">b</p><p><em>a</em></p>'),
          cReadAction(false, [1, 0, 0], 0),
          cAssertMoveToElementAction([0])
        ])),
        Logger.t('Should be moveToElement since it is delete after ce=false before another ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">b</p><p data-mce-caret="after"><br></p><p contenteditable="false">b</p>'),
          cReadAction(true, [1], 0),
          cAssertMoveToElementAction([2])
        ])),
        Logger.t('Should be moveToElement since it is backspace before a ce=false element before a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">b</p><p data-mce-caret="before"><br></p><p contenteditable="false">b</p>'),
          cReadAction(false, [1], 0),
          cAssertMoveToElementAction([0])
        ]))
      ])),

      Logger.t('RemoveElement actions where caret is near a cef element', GeneralSteps.sequence([
        Logger.t('Should be removeElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
          cReadAction(true, [], 0),
          cAssertRemoveElementAction([0])
        ])),
        Logger.t('Should be removeElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
          cReadAction(true, [], 1),
          cAssertRemoveElementAction([1])
        ])),
        Logger.t('Should be removeElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
          cReadAction(false, [], 2),
          cAssertRemoveElementAction([1])
        ])),
        Logger.t('Should be removeElement action since it next to a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>'),
          cReadAction(false, [], 1),
          cAssertRemoveElementAction([0])
        ])),
        Logger.t('Should be removeElement since it is backspace after a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">b</p><p data-mce-caret="after"><br></p><p contenteditable="false">b</p>'),
          cReadAction(false, [1], 0),
          cAssertRemoveElementAction([0])
        ])),
        Logger.t('Should be removeElement since it is delete before a ce=false', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">b</p><p data-mce-caret="before"><br></p><p contenteditable="false">b</p>'),
          cReadAction(true, [1], 0),
          cAssertRemoveElementAction([2])
        ])),
        Logger.t('Should be removeElement since the block you are deleting from is empty', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">b</p><p><br></p><p contenteditable="false">b</p>'),
          cReadAction(true, [1], 0),
          cAssertRemoveElementAction([1])
        ])),
        Logger.t('Should be removeElement since the block you are deleting from is empty', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">b</p><p><br></p><p contenteditable="false">b</p>'),
          cReadAction(false, [1], 0),
          cAssertRemoveElementAction([1])
        ]))
      ])),

      Logger.t('moveToPosition actions where caret is to be moved from cef to normal content', GeneralSteps.sequence([
        Logger.t('Should be moveToPosition action since we are after a ce=false and moving forwards to normal content', Chain.asStep(viewBlock, [
          cSetHtml('<p contenteditable="false">a</p><p>b</p>'),
          cReadAction(true, [], 1),
          cAssertMoveToPositionAction([1, 0], 0)
        ])),
        Logger.t('Should be moveToPosition action since we are before a ce=false and moving backwards to normal content', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p><p contenteditable="false">b</p>'),
          cReadAction(false, [], 1),
          cAssertMoveToPositionAction([0, 0], 1)
        ]))
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);