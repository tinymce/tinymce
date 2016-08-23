test(
  'ResultValueTest',

  [

  ],

  function () {
    Jsc.property("Element appended to array exists in array", "json", "[json]", function(i, arr) {
      var arr2 = Arr.flatten([arr, [i]]);
      return Arr.exists(arr2, eqc(i));
    });
  }
);