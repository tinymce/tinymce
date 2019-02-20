import { Attr, Element, Insert, InsertAll } from '@ephox/sugar';

const nu = function (tag: string, id: string) {
  const r = Element.fromTag(tag);
  Attr.set(r, 'id', id);
  return r;
};

export default function () {

  const container = nu('div', 'root');

  const d100 = nu('div', 'd100');
  const p100 = nu('p', 'p100');
  const t100 = Element.fromText('Text in paragraph');
  const p200 = nu('p', 'p200');
  const t200 = Element.fromText('Text before span ');
  const t220 = Element.fromText('and this --- ');
  const t250 = Element.fromText('cat');
  const t260 = Element.fromText('er');
  const t270 = Element.fromText('pillar');
  const t280 = Element.fromText(' and ');

  const s100 = nu('span', 's100');
  const t300 = Element.fromText('here');

  const s200 = nu('span', 's200');
  const t400 = Element.fromText(' is ');

  const s300 = nu('span', 's300');
  const t500 = Element.fromText('something');
  const p300 = nu('p', 'p300');
  const t600 = Element.fromText('More data');

  const d200 = nu('div', 'd200');
  const t700 = Element.fromText('Next ');
  const p400 = nu('p', 'p400');
  const t800 = Element.fromText('Section ');

  const s400 = nu('span', 's400');
  const t900 = Element.fromText('no');
  const t1000 = Element.fromText('w');

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

  const connect = function (element: Element) {
    Insert.append(element, container);
  };

  return {
    connect,
    d100,
    p100,
    t100,
    p200,
    t200,
    t220,
    t250,
    t260,
    t270,
    t280,
    s100,
    t300,
    s200,
    t400,
    s300,
    t500,
    p300,
    t600,
    d200,
    t700,
    p400,
    t800,
    s400,
    t900,
    t1000
  };
};