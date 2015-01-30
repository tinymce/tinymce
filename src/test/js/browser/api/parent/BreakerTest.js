test(
  'parent :: Breaker',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Hierarchy',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.SelectorFind'
  ],

  function (DomUniverse, Arr, Fun, Option, DomParent, Compare, Element, Hierarchy, Html, SelectorFind) {

    var check = function (expected, p, c) {
      var container = Element.fromTag('div');
      container.dom().innerHTML =
        '<ol class="one-nine" style="list-style-type: decimal;">' +
          '<li class="one">One</li>' +
          '<li class="two">Two</li>' +
          '<ol class="three-five" style="list-style-type: lower-alpha;">' +
            '<li class="three">three</li>' +
            '<li class="four">four</li>' +
            '<li class="five">five</li>' +
          '</ol>' +
          '<li class="six">six</li>' +
          '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
            '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
              '<li class="seven">seven</li>' +
              '<li class="eight">eight</li>' +
            '</ol>' +
            '<li class="nine">nine</li>' +
          '</ol>' +
        '</ol>';

      var parent = SelectorFind.descendant(container, '.' + p).getOrDie();
      var child = SelectorFind.descendant(container, '.' + c).getOrDie();
      DomParent.breakAt(parent, child);
      assert.eq(expected, Html.get(container));
    };

    check('<ol class="one-nine" style="list-style-type: decimal;">' +
          '<li class="one">One</li>' +
          '<li class="two">Two</li>' +
          '<ol class="three-five" style="list-style-type: lower-alpha;">' +
            '<li class="three">three</li>' +
            '<li class="four">four</li>' +
            '<li class="five">five</li>' +
          '</ol>' +
          '<ol class="three-five" style="list-style-type: lower-alpha;">' +
          '</ol>' +
          '<li class="six">six</li>' +
          '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
            '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
              '<li class="seven">seven</li>' +
              '<li class="eight">eight</li>' +
            '</ol>' +
            '<li class="nine">nine</li>' +
          '</ol>' +
        '</ol>', 'three-five', 'five', DomParent.breakAt);

    check(
        '<ol class="one-nine" style="list-style-type: decimal;">' +
          '<li class="one">One</li>' +
          '<li class="two">Two</li>' +
          '<ol class="three-five" style="list-style-type: lower-alpha;">' +
            '<li class="three">three</li>' +
            '<li class="four">four</li>' +
            '<li class="five">five</li>' +
          '</ol>' +
          '<li class="six">six</li>' +
        '</ol>' +
        '<ol class="one-nine" style="list-style-type: decimal;">' +
          '<ol class="seven-nine" style="list-style-type: lower-alpha;">' +
            '<ol class="seven-eight" style="list-style-type: lower-roman;">' +
              '<li class="seven">seven</li>' +
              '<li class="eight">eight</li>' +
            '</ol>' +
            '<li class="nine">nine</li>' +
          '</ol>' +
        '</ol>', 'one-nine', 'six', DomParent.breakAt);


    var checkPath = function (expected, input, p, c) {
      console.log('TEST');
      var container = Element.fromTag('div');
      container.dom().innerHTML = input;

      var parent = Hierarchy.follow(container, p).getOrDie();
      var child = Hierarchy.follow(container, c).getOrDie();
      var isTop = Fun.curry(Compare.eq, parent);
      DomParent.breakPath(child, isTop, function (parent, child) {
        var bisect = function (universe, parent, child) {
          var children = universe.property().children(parent);
          var index = Arr.findIndex(children, Fun.curry(universe.eq, child));
          return index > -1 ? Option.some({
            before: Fun.constant(children.slice(0, index)),
            after: Fun.constant(children.slice(index + 1))
          }) : Option.none();
        };

        // var unsafeBreakAt = function (universe, parents, parts) {
        //   var second = universe.create().clone(parent);
        //   universe.insert().appendAll(second, parts.after());
        //   universe.insert().after(parent, second);
        //   return second;
        // };

        var unsafeBreakAt = function (universe, parent, parts) {
          console.log('html before', container.dom().innerHTML);
          var prior = universe.create().clone(parent);
          console.log('clone: ', 'was: ', prior.dom().cloneNode(true), 'now: ', prior.dom());
          console.log('child: ', 'was: ', child.dom().cloneNode(true), 'now: ', child.dom());
          console.log('parent: ', 'was: ', parent.dom().cloneNode(true), 'now: ', parent.dom());
          console.log('parts.before: ', 'were: ', Arr.map(parts.before(), function (p) { return p.dom().cloneNode(true); }), 
            'now: ', Arr.map(parts.before(), function (p) { return p.dom(); }));
          console.log('parts.after: ', 'were: ', Arr.map(parts.after(), function (p) { return p.dom().cloneNode(true); }), 
            'now: ', Arr.map(parts.after(), function (p) { return p.dom(); }));
          universe.insert().appendAll(prior, parts.before().concat([ child ]));
          universe.insert().appendAll(parent, parts.after());
          universe.insert().before(parent, prior);
          console.log('post.clone: ', 'was: ', prior.dom().cloneNode(true), 'now: ', prior.dom());
          console.log('post.parent: ', 'was: ', parent.dom().cloneNode(true), 'now: ', parent.dom());
          console.log('html after: ', container.dom().innerHTML);
          return parent;
        };

        var parts = bisect(DomUniverse(), parent, child);
        return parts.map(function (ps) {
          return unsafeBreakAt(DomUniverse(), parent, ps);
        });
      });
      assert.eq(expected, Html.get(container));
    };

    checkPath(
      '<div>' +
        '<font>' +
          '<span>Cat</span>' +
          '<span>Dog</span>' +
        '</font>' +
        '<font>' +
          '<span></span>' +
        '</font>' +
      '</div>',

      '<div>' +
        '<font>' +
          '<span>Cat</span>' +
          '<span>Dog</span>' +
        '</font>' +
      '</div>',
      [ 0, 0 ], [ 0, 0, 1, 0 ]);

    checkPath(
      '<div>' +
        '<font>' +
          '<span>Cat</span>' +
          '<span>' +
            'Hello' +
            '<br>' + // --- SPLIT to <font>
          '</span>' +
        '</font>' +
        '<font>' +
          '<span>' +
            'World' +
          '</span>' +
          '<span>Dog</span>' +
        '</font>' +
      '</div>',

      '<div>' +
        '<font>' +
          '<span>Cat</span>' +
          '<span>' +
            'Hello' +
            '<br>' +
            'World' +
          '</span>' +
          '<span>Dog</span>' +
        '</font>' +
      '</div>',
      [ 0, 0 ], [ 0, 0, 1, 1 ]);

    checkPath(
      '<div>' +
        '<font>' +
          '<span>Cat</span>' +
          '<span>' +
            'Hello' +
            '<br>' + 
            'World' + // --- SPLIT to <font>
          '</span>' +
        '</font>' +
        '<font>' +
          '<span></span>' +
          '<span>Dog</span>' +
        '</font>' +
      '</div>',

      '<div>' +
        '<font>' +
          '<span>Cat</span>' +
          '<span>' +
            'Hello' +
            '<br>' +
            'World' +
          '</span>' +
          '<span>Dog</span>' +
        '</font>' +
      '</div>',
      [ 0, 0 ], [ 0, 0, 1, 2 ]);

    checkPath(
      '<div>' +
        '<font>' +
          '<span>Cat</span>' +
          '<span>' +
            'Hello' + // --- SPLIT to <font>            
          '</span>' +
        '</font>' +
        '<font>' +
          '<span>' +
            '<br>' + 
            'World' +
          '</span>' +
          '<span>Dog</span>' +
        '</font>' +
      '</div>',

      '<div>' +
        '<font>' +
          '<span>Cat</span>' +
          '<span>' +
            'Hello' +
            '<br>' +
            'World' +
          '</span>' +
          '<span>Dog</span>' +
        '</font>' +
      '</div>',
      [ 0, 0 ], [ 0, 0, 1, 0 ]);
  }
);
