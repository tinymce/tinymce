import { console, document } from '@ephox/dom-globals';
import { AriaGrid } from '@ephox/echo';
import { Attr, DomEvent, Element, Focus, Insert, Ready, Remove } from '@ephox/sugar';
import { PickerDirection } from 'ephox/snooker/api/PickerDirection';
import DemoTranslations from 'ephox/snooker/demo/DemoTranslations';
import { PickerUi } from 'ephox/snooker/picker/PickerUi';
import { Option } from '@ephox/katamari';

/* tslint:disable:no-console */

Ready.execute(function () {

  const picker = PickerUi(PickerDirection.rtl, {
    maxCols: 10,
    maxRows: 10,
    minCols: 1,
    minRows: 1
  }, AriaGrid.createHelp(10, 10, DemoTranslations));

  const ephoxUi = Element.fromDom(Option.from(document.getElementById('ephox-ui')).getOrDie('Missing "ephox-ui"'));
  Remove.empty(ephoxUi);
  Insert.append(ephoxUi, picker.element());
  Attr.set(ephoxUi, 'dir', 'rtl');

  picker.setSize(10, 10);
  picker.setHeaders(1, 1);
  picker.setSelection(2, 2);

  picker.events.select.bind( function (event) {
    console.log('need to create table with ', event.cols(), 'columns and ', event.rows(), 'rows' );
    console.log('headers: ', event.rowHeaders() + ' x ' + event.columnHeaders());
  });

  picker.on();

  DomEvent.bind(ephoxUi, 'keydown', function (event) {
    const key = event.raw().which;
    if (key === 37) {
      picker.sendLeft();
    } else if (key === 39) {
      picker.sendRight();
    } else if (key === 40) {
      picker.sendDown();
    } else if (key === 38) {
      picker.sendUp();
    } else if (key === 32 || key === 13) {
      picker.sendExecute();
    }
    event.kill();
  });

  Attr.set(ephoxUi, 'tabIndex', '-1');
  Focus.focus(ephoxUi);
});