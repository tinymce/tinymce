test(
  'MaurizioTest',

  [
    'ephox.snooker.model.Warefun'
  ],

  function (Warefun) {
    /* global assert */


    var structure = [
      [ 1, 1, 1, 4, 5 ],
      [ 1, 1, 1, 4, 5 ],
      [ 1, 1, 1, 4, 5 ],
      [ 1, 1, 1, 4, 5 ],
      [ 1, 1, 1, 4, 5 ],
      [ 1, 1, 1, 4, 5 ],
    ];

    var structure2 = [
      [ 1, 2, 3 ],
      [ 4, 5, 3 ]
    ];






    var something = Warefun.render(structure);

    console.log('something',something);



  }
);