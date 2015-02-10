define(
  'ephox.snooker.demo.PickerDemo',

  [
    'ephox.snooker.api.PickerDirection',
    'ephox.snooker.picker.PickerUi',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!Math',
    'global!document'
  ],

  function (PickerDirection, PickerUi, Attr, DomEvent, Element, Focus, Insert, Remove, Math, document) {
    return function () {

      var picker = PickerUi(PickerDirection.ltr, {
        maxCols: 10,
        maxRows: 10,
        minCols: 1,
        minRows: 1
      });

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      var wrap = Element.fromTag('div');

      Remove.empty(ephoxUi);

      Insert.append(ephoxUi, wrap);
      Insert.append(wrap, picker.element());

/*
BACKSPACE : getConstant([8]),
      TAB : getConstant([9]),
      ENTER : getConstant([13]),
      SHIFT : getConstant([16]),
      CTRL : getConstant([17]),
      ALT : getConstant([18]),
      CAPSLOCK : getConstant([20]),
      ESCAPE : getConstant([27]),
      SPACE: getConstant([32]),
      PAGEUP: getConstant([33]),
      PAGEDOWN: getConstant([34]),
      END: getConstant([35]),
      HOME: getConstant([36]),
      LEFT: getConstant([37]),
      UP: getConstant([38]),
      RIGHT: getConstant([39]),
      DOWN: getConstant([40]),
      INSERT: getConstant([45]),
      DEL: getConstant([46]),
      META: getConstant([91, 93, 224]),
      F10: getConstant([121])
      */

      DomEvent.bind(ephoxUi, 'keydown', function (event) {
        var key = event.raw().which;
        if (key === 37) picker.sendLeft();
        else if (key === 39) picker.sendRight();
        else if (key === 40) picker.sendDown();
        else if (key === 38) picker.sendUp();
        else if (key === 32 || key === 13) picker.sendExecute();
        event.kill();
      });


      var val = 3;

      picker.setSize(10, 10);
      picker.setHeaders(1, 1);
      picker.setSelection(2, 2);

      picker.events.select.bind( function(event) {
        console.log('need to create table with ', event.cols(), 'columns and ', event.rows(), 'rows' );
        console.log('headers: ', event.rowHeaders() + ' x ' + event.columnHeaders());
      });



      picker.on();

      Attr.set(ephoxUi, 'tabIndex', '-1');
      Focus.focus(ephoxUi);
    };
  }
);
