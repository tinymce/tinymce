define(
  'ephox.snooker.demo.PickerDemo',

  [
    'ephox.snooker.picker.Picker',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Width',
    'global!Math'
  ],

  function (Picker, Element, Height, Insert, Width, Math) {
    return function () {
      
      var picker = Picker();
      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));

      Insert.append(ephoxUi, picker.element());

      var val = 3;

      picker.setSize(10, 10);
      picker.setSelection(2, 2);

      picker.events.resize.bind( function() { 
        var width = Width.get(picker.element());
        var height = Height.get(picker.element());
        console.log('picker was resized : (', width, ',', height, ')');
      });

      picker.events.select.bind( function(event) {
        console.log('need to create table with ', event.cols(), 'columns and ', event.rows(), 'rows' );
      });


      picker.on();

      // setInterval(function () {
      //   val++;
      //   picker.setSize(val, val);

      //   picker.setSelection( Math.ceil(Math.random() * val) ,Math.ceil(Math.random() * val));
      // }, 1000);
    };
  }
);
