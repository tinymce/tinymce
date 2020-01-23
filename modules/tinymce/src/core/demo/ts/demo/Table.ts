import { Body, DomEvent, Traverse, Node, Element, SelectorFind, SelectorFilter, Attr } from '@ephox/sugar';
import { Arr } from '@ephox/katamari/src/main/ts/ephox/katamari/api/Main';

const tableNames = ['td', 'th', 'tr', 'thead', 'tbody', 'tfoot', 'table'];

const modelSection = (section: Element) => {
  const trs = SelectorFilter.children(section, 'tr');
  for (let i = 0; i < trs.length; i++) {
    const cells = SelectorFilter.children(trs[i], 'td');
    for (let ii = 0; ii < cells.length; ii++) {
      const rowspan = Attr.has(cells[ii], 'rowspan') ? parseInt(Attr.get(cells[ii], 'rowspan'), 10) : 1;
      const colspan = Attr.has(cells[ii], 'colspan') ? parseInt(Attr.get(cells[ii], 'colspan'), 10) : 1;
    }
    console.log(cells);
  }
};

const buildModel = (table: Element) => {
  const thead = SelectorFind.child(table, 'thead').map(modelSection);
  const tbody = SelectorFind.child(table, 'tbody').map(modelSection);
  const tfoot = SelectorFind.child(table, 'tfoot').map(modelSection);
  return {
    thead,
    tbody,
    tfoot
  };
};

const getTableParent = (target: Element) => {
  const tableOpt = SelectorFind.closest(target, 'table');
  const modelOpt = tableOpt.map(buildModel);
  console.log(modelOpt.getOrDie());
};

const inTable = (target: Element) => {
  const name = Node.name(target);
  return Arr.contains(tableNames, name);
};

const register = () => {
  const body = Body.body();

  const click = DomEvent.bind(body, 'click', (e) => {
    const target = e.target();
    if (inTable(target)) {
      getTableParent(target);
    } else {
      const parents = Traverse.parents(target);
      const parentInTable = Arr.exists(parents, (parent) => {
        return inTable(target);
      });
      if (parentInTable) {
        getTableParent(target);
      }
    }
  });
  // click.unbind();
};

export {
  register
};