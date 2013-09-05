test(
  '---- example :: BlockTest ----',

  [
    'ephox.robin.api.dom.DomLook',
    'ephox.robin.api.dom.DomParent',
    'ephox.robin.test.BrowserCheck',
    'ephox.sugar.api.Node'
  ],

  function (DomLook, DomParent, BrowserCheck, Node) {
    var check = function (expected, input, look) {
      BrowserCheck.run(input, function (node) {
        var actual = DomParent.sharedOne(look, [ node ]);
        actual.fold(function () {
          assert.fail('Expected a common ' + expected + ' tag');
        }, function (act) {
          console.log('act: ', act.dom());
          assert.eq(expected, Node.name(act));
        });
      });
    };

    var checkNone = function (input, look) {
      BrowserCheck.run(input, function (node) {
        var actual = DomParent.sharedOne(look, [ node ]);
        actual.each(function (a) {
          assert.fail('Expected no common tag matching the look. Received: ' + Node.name(a));
        });
      });
    };
    
    check('p', '<p>this<span class="me"> is it </span></p>', DomLook.selector('p'));
    checkNone('<p>this<span class="me"> is it</span></p>', DomLook.selector('blockquote'));

    check('p', '<p>this<span class="me"> is it </span></p>', DomLook.predicate(function (element) {
      return Node.name(element) === 'p';
    }));
  }
);
