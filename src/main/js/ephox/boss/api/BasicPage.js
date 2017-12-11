import { Attr } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';

var nu = function (tag, id) {
  var r = Element.fromTag(tag);
  Attr.set(r, 'id', id);
  return r;
};

export default <any> function () {

  var container = nu('div', 'root');

  var d100 = nu('div', 'd100');
  var p100 = nu('p', 'p100');
  var t100 = Element.fromText('Text in paragraph');
  var p200 = nu('p', 'p200');
  var t200 = Element.fromText('Text before span ');
  var t220 = Element.fromText('and this --- ');
  var t250 = Element.fromText('cat');
  var t260 = Element.fromText('er');
  var t270 = Element.fromText('pillar');
  var t280 = Element.fromText(' and ');

  var s100 = nu('span', 's100');
  var t300 = Element.fromText('here');

  var s200 = nu('span', 's200');
  var t400 = Element.fromText(' is ');

  var s300 = nu('span', 's300');
  var t500 = Element.fromText('something');
  var p300 = nu('p', 'p300');
  var t600 = Element.fromText('More data');

  var d200 = nu('div', 'd200');
  var t700 = Element.fromText('Next ');
  var p400 = nu('p', 'p400');
  var t800 = Element.fromText('Section ');

  var s400 = nu('span', 's400');
  var t900 = Element.fromText('no');
  var t1000 = Element.fromText('w');

  InsertAll.append(container, [d100, d200]);
  InsertAll.append(d100, [p100, p200, p300]);
  InsertAll.append(p100, [t100]);
  InsertAll.append(p200, [t200, t220, t250, t260, t270, t280, s100, s200]);
  InsertAll.append(s100, [t300]);
  InsertAll.append(s200, [t400, s300]);
  InsertAll.append(s300, [t500]);
  InsertAll.append(p300, [t600]);
  InsertAll.append(d200, [t700, p400]);
  InsertAll.append(p400, [t800, s400]);
  InsertAll.append(s400, [t900, t1000]);

  var connect = function (element) {
    Insert.append(element, container);
  };

  return {
    connect: connect,
    d100: d100,
    p100: p100,
    t100: t100,
    p200: p200,
    t200: t200,
    t220: t220,
    t250: t250,
    t260: t260,
    t270: t270,
    t280: t280,
    s100: s100,
    t300: t300,
    s200: s200,
    t400: t400,
    s300: s300,
    t500: t500,
    p300: p300,
    t600: t600,
    d200: d200,
    t700: t700,
    p400: p400,
    t800: t800,
    s400: s400,
    t900: t900,
    t1000: t1000
  };
};