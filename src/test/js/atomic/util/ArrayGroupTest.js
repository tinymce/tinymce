test(
  'ArrayGroupTest',

  [
    'ephox.robin.util.ArrayGroup'
  ],

  function (ArrayGroup) {
    var groups = ArrayGroup();


    
    groups.add('a');
    groups.add('b');

    assert.eq([ [ 'a', 'b' ] ], groups.done());

    groups.begin('1');

    assert.eq([ [ 'a', 'b' ], [ '1' ] ], groups.done());

    groups.add('2');
    assert.eq([ [ 'a', 'b' ], [ '1', '2' ] ], groups.done());

    groups.add('3');
    groups.add('4');
    assert.eq([ [ 'a', 'b' ], [ '1', '2', '3', '4' ] ], groups.done());

    groups.end();
    groups.separator('-');
    assert.eq([ [ 'a', 'b' ], [ '1', '2', '3', '4' ], [ '-' ] ], groups.done());    

    groups.add('i');
    groups.separator('-');
    groups.add('a');
    assert.eq([ [ 'a', 'b' ], [ '1', '2', '3', '4' ], [ '-' ], [ 'i' ], [ '-' ], [ 'a' ] ], groups.done());        
  }
);