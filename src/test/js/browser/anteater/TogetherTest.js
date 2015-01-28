test(
  'TogetherTest',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.compass.Arr',
    'ephox.robin.anteater.Tortoise',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Hierarchy',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll'
  ],

  function (DomUniverse, Arr, Tortoise, Body, Compare, Element, Hierarchy, Html, Insert, InsertAll) {
    var body = Body.body();

    var container = Element.fromTag('div'); 

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

    var check = function (expected, start, soffset, finish, foffset) {
      var premark = Tortoise.tortoise(DomUniverse(), isRoot, find(start), soffset, find(finish), foffset);
      Arr.each(premark, mark);
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
      '<p>This is <span>completely <i>different <b>t</b></i><strong><i><b>o</b> </i>what you would<span>_expected_</span></strong></span></p>' +
      '<p><strong>And more <u>of this is <span>h</span></u></strong><u><span>ere</span> again</u>.</p>',
      [ 0, 1, 1, 1, 0 ], 't'.length, [ 1, 1, 1, 0 ], 'h'.length
    );
  }
);