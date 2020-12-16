import { Attribute, Insert, InsertAll, SugarElement } from '@ephox/sugar';

const nu = (tag: string, id: string) => {
  const r = SugarElement.fromTag(tag);
  Attribute.set(r, 'id', id);
  return r;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default () => {

  const container = nu('div', 'root');

  const d100 = nu('div', 'd100');
  const p100 = nu('p', 'p100');
  const t100 = SugarElement.fromText('Text in paragraph');
  const p200 = nu('p', 'p200');
  const t200 = SugarElement.fromText('Text before span ');
  const t220 = SugarElement.fromText('and this --- ');
  const t250 = SugarElement.fromText('cat');
  const t260 = SugarElement.fromText('er');
  const t270 = SugarElement.fromText('pillar');
  const t280 = SugarElement.fromText(' and ');

  const s100 = nu('span', 's100');
  const t300 = SugarElement.fromText('here');

  const s200 = nu('span', 's200');
  const t400 = SugarElement.fromText(' is ');

  const s300 = nu('span', 's300');
  const t500 = SugarElement.fromText('something');
  const p300 = nu('p', 'p300');
  const t600 = SugarElement.fromText('More data');

  const d200 = nu('div', 'd200');
  const t700 = SugarElement.fromText('Next ');
  const p400 = nu('p', 'p400');
  const t800 = SugarElement.fromText('Section ');

  const s400 = nu('span', 's400');
  const t900 = SugarElement.fromText('no');
  const t1000 = SugarElement.fromText('w');

  InsertAll.append(container, [ d100, d200 ]);
  InsertAll.append(d100, [ p100, p200, p300 ]);
  InsertAll.append(p100, [ t100 ]);
  InsertAll.append(p200, [ t200, t220, t250, t260, t270, t280, s100, s200 ]);
  InsertAll.append(s100, [ t300 ]);
  InsertAll.append(s200, [ t400, s300 ]);
  InsertAll.append(s300, [ t500 ]);
  InsertAll.append(p300, [ t600 ]);
  InsertAll.append(d200, [ t700, p400 ]);
  InsertAll.append(p400, [ t800, s400 ]);
  InsertAll.append(s400, [ t900, t1000 ]);

  const connect = (element: SugarElement) => {
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
