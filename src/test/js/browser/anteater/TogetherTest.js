test(
  'TogetherTest',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.compass.Arr',
    'ephox.robin.anteater.Coyotes',
    'ephox.robin.anteater.Placid',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Hierarchy',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse'
  ],

  function (DomUniverse, Arr, Coyotes, Placid, Body, Compare, Element, Hierarchy, Html, Insert, InsertAll, Node, Text, Traverse) {
    var body = Body.body();

    var container = Element.fromTag('div');
    container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';

    Insert.append(body, container);

    var find = function (path) {
      return Hierarchy.follow(container, path).getOrDie('Could not find the path: ' + path.join(','));
    };

    var isRoot = function (elem) {
      return Compare.eq(elem, container);
    };

    var mark = function (result) {
      result.each(function (res) {
        if (res.length > 0) {
          console.log('Things getting wrapped: ', Arr.map(res, function (r) { return r.dom(); }));
          var strong = Element.fromTag('strong');
          Insert.before(res[0], strong);
          InsertAll.append(strong, res);
        }
      });
    };

    // Obj.each(paths, function (path, value) {
    //   console.log('path of: ' + value, path, find(path).dom());
    // });
    // console.log('start: ', Hierarchy.follow(container, [ 0, 1, 0 ]).getOrDie().dom());
    var check = function (expected, start, soffset, finish, foffset) {
      // Ok, so firstly, we need to get the coyotes
      var coyotes = Coyotes.wile(DomUniverse(), isRoot, find(start), soffset, find(finish), foffset);

      Arr.each(coyotes, function (coyote) {
        console.log('****************** coyote', coyote.start.dom(), coyote.soffset, coyote.end.dom(), coyote.eoffset);
        var actual = Placid.placid(DomUniverse(), isRoot, coyote.start, coyote.soffset, coyote.end, coyote.eoffset);
        console.log('placid.done');
        mark(actual);  
      })


      
      assert.eq(expected, Html.get(container));
    };

    container.dom().innerHTML =
      '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
      '<p>And another <u>paragraph</u></p>' +
      '<p>Plus one more.</p>' +
      '<p>Last one, I promise</p>';
    check(
      '<p>This is <b>the</b><strong><b> word</b> that I can understand, even if <i>it</i> is not the same as before.</strong></p>' +
      '<p><strong>And another <u>paragraph</u></strong></p>' +
      '<p><strong>Plus one more.</strong></p>' +
      '<p><strong>Last</strong> one, I promise</p>',
      [ 0, 1, 0 ], 'the'.length, [ 3, 0 ], 'Last'.length
    ); 

    container.dom().innerHTML =
      '<p>This is <span>completely <i>different <b>to</b> </i>what you would<span>_expected_</span></span></p>' +
      '<p>And more <u>of this is <span>here</span> again</u>.</p>';
    check(
      '<p>This is <span>completely <i>different <b>to</b> </i>what you would<span>_expected_</span></span></p>' +
      '<p>And more <u>of this is <span>here</span> again</u>.</p>',
      [ 0, 1, 1, 1, 0 ], 't'.length, [ 1, 1, 1, 0 ], 'h'.length
    );
  }
);