asynctest(
  'atomic.tinymce.core.keyboard.MatchKeysTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Merger',
    'tinymce.core.keyboard.MatchKeys'
  ],
  function (Assertions, Pipeline, Step, Merger, MatchKeys) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var event = function (evt) {
      return Merger.merge({
        shiftKey: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        keyCode: 0
      }, evt);
    };

    var testAction1 = function () {
    };

    var testAction2 = function () {
    };

    var sTestMatch = Step.sync(function () {
      Assertions.assertEq(
        'Empty patterns shouldn\'t match anything',
        true,
        MatchKeys.match([], {}).isNone()
      );

      Assertions.assertEq(
        'Should match first keyCode',
        true,
        MatchKeys.match([{ keyCode: 65 }], event({ keyCode: 65 })).isSome()
      );

      Assertions.assertEq(
        'Should match anything keyCode',
        true,
        MatchKeys.match([{ keyCode: 123 }], event({ keyCode: 65 })).isNone()
      );

      Assertions.assertEq(
        'Should match first keyCode and action should be correct',
        testAction1,
        MatchKeys.match([{ keyCode: 65, action: testAction1 }], event({ keyCode: 65 })).getOrDie()
      );

      Assertions.assertEq(
        'Should match shiftKey keyCode',
        testAction1,
        MatchKeys.match([
          { keyCode: 65, action: testAction2 },
          { keyCode: 65, shiftKey: true, action: testAction1 }
        ], event({ keyCode: 65, shiftKey: true })).getOrDie()
      );

      Assertions.assertEq(
        'Should match altKey keyCode',
        testAction1,
        MatchKeys.match([
          { keyCode: 65, action: testAction2 },
          { keyCode: 65, altKey: true, action: testAction1 }
        ], event({ keyCode: 65, altKey: true })).getOrDie()
      );

      Assertions.assertEq(
        'Should match ctrlKey keyCode',
        testAction1,
        MatchKeys.match([
          { keyCode: 65, action: testAction2 },
          { keyCode: 65, ctrlKey: true, action: testAction1 }
        ], event({ keyCode: 65, ctrlKey: true })).getOrDie()
      );

      Assertions.assertEq(
        'Should match metaKey keyCode',
        testAction1,
        MatchKeys.match([
          { keyCode: 65, action: testAction2 },
          { keyCode: 65, metaKey: true, action: testAction1 }
        ], event({ keyCode: 65, metaKey: true })).getOrDie()
      );

      Assertions.assertEq(
        'Should match metaKey+ctrlKey but not metaKey+ctrlKey+altKey keyCode',
        testAction1,
        MatchKeys.match([
          { keyCode: 65, ctrlKey: true, metaKey: true, altKey: true, action: testAction2 },
          { keyCode: 65, metaKey: true, ctrlKey: true, action: testAction1 }
        ], event({ keyCode: 65, metaKey: true, ctrlKey: true })).getOrDie()
      );
    });

    Pipeline.async({}, [
      sTestMatch
    ], function () {
      success();
    }, failure);
  }
);
