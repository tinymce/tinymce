test(
  'AttrTransfer',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.test.Div'
  ],

  function (Arr, Obj, Attr, Div) {
    var alpha = function () {
      var r = Div();
      Attr.setAll(r, {
        title: 'monkey',
        placeholder: 'start typing'
      });
      return r;
    };

    var beta = function () {
      var r = Div();
      Attr.setAll(r, {
        title: 'chimp',
        name: 'anon'
      });
      return r;
    };

    var gamma = function () {
      var r = Div();
      Attr.setAll(r, {
        placeholder: 'lookup'
      });
      return r;
    };
    

    var check = function (expectedPresent, expectedAbsent, source, destination, attributes) {
      Attr.transfer(source, destination, attributes);
      Arr.each(expectedAbsent, function (k) {
        if (Attr.has(destination, k)) assert.fail('Result should not have attribute: ' + k);
      });

      Obj.each(expectedPresent, function (v, k) {
        if (!Attr.has(destination, k)) assert.fail('Result should have attribute: ' + k);
        else assert.eq(v, Attr.get(destination, k));
      });
    };

    check({
      title: 'chimp',
      placeholder: 'start typing',
      name: 'anon'
    }, [ 'id' ], alpha(), beta(), [ 'title', 'placeholder' ]);

    check({
      title: 'chimp',
      placeholder: 'start typing',
      name: 'anon'
    }, [ 'id' ], alpha(), beta(), [ 'placeholder' ]);

    check({
      title: 'chimp',
      name: 'anon'
    }, [ 'placeholder' ], alpha(), beta(), [ 'title' ]);

    check({
      title: 'monkey',
      placeholder: 'lookup'
    }, [ ], alpha(), gamma(), [ 'title' ]);

    check({
      placeholder: 'lookup'
    }, [ 'title' ], alpha(), gamma(), [ ]);

    check({
      title: 'chimp',
      name: 'anon',
      placeholder: 'lookup'
    }, [ ], beta(), gamma(), [ 'title', 'name', 'placeholder' ]);

    check({
      title: 'chimp',
      placeholder: 'lookup'
    }, [ 'name' ], beta(), gamma(), [ 'title', 'placeholder' ]);

  }
);
