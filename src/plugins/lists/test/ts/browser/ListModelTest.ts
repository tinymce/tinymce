import { Arbitraries } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import Jsc from '@ephox/wrap-jsverify';
import { composeList } from '../../../main/ts/listModel/ComposeList';
import { parseLists } from '../../../main/ts/listModel/ParseLists';
import { Arr, Option } from '@ephox/katamari';
import { normalizeEntries } from '../../../main/ts/listModel/NormalizeEntries';
import { ListType } from '../../../main/ts/listModel/ListType';
import { Entry } from '../../../main/ts/listModel/Entry';
import { Element } from '@ephox/sugar';

UnitTest.test('ListModelTest', () => {
  const arbitratyContent = Jsc.bless({
    generator: Arbitraries.content('inline').generator.map((el) => [el])
  });

  const arbitraryEntry = Jsc.record({
    isSelected: Jsc.constant(false),
    depth: Jsc.integer(1, 10),
    content: Jsc.small(arbitratyContent),
    listType: Jsc.oneof(Jsc.constant(ListType.OL), Jsc.constant(ListType.UL)),
    listAttributes: Jsc.oneof(Jsc.constant({}), Jsc.constant({style: 'list-style-type: lower-alpha;'})),
    itemAttributes: Jsc.oneof(Jsc.constant({}), Jsc.constant({style: 'color: red;'})),
  });

  const arbitraryEntries = Jsc.array(arbitraryEntry);

  const composeParseProperty = Jsc.forall(arbitraryEntries, (inputEntries: Entry[]) => {
    normalizeEntries(inputEntries);
    const outputEntries = composeParse(inputEntries);
    return isForAll(inputEntries, outputEntries, isEqualEntry) || errorMessage(inputEntries, outputEntries);
  });

  const composeParse = (entries: Entry[]): Entry[] => {
    return composeList(entries)
      .map((list) => parseLists([list], Option.none()))
      .bind(Arr.head)
      .map((entrySet) => entrySet.entries)
      .getOr([]);
  };

  const isEqualEntry = (a: Entry, b: Entry): boolean => {
    return stringifyEntry(a) === stringifyEntry(b);
  };

  const errorMessage = (inputEntries: Entry[], outputEntries: Entry[]) => {
    return `\nPretty print counterexample:\n` +
    `input: [${entriesToString(inputEntries)}\n]\n` +
    `output: [${entriesToString(outputEntries)}\n]`;
  };

  const entriesToString = (entries: Entry[]) => {
    return Arr.map(entries, stringifyEntry).join(',');
  };

  const stringifyEntry = (entry: Entry) => {
    return `\n  {
      depth: ${entry.depth}
      content: ${entry.content.length > 0 ? serializeElements(entry.content) : '[Empty]'}
      listType: ${entry.listType}
      isSelected: ${entry.isSelected}
      listAttributes: ${JSON.stringify(entry.listAttributes)}
      itemAttributes: ${JSON.stringify(entry.itemAttributes)}
    }`;
  };

  const isForAll = (a: any[], b: any[], cmp: (x: any, y: any) => boolean): boolean => {
    return a.length === b.length && Arr.forall(a, (_a, i) => cmp(_a, b[i]));
  };

  const serializeElements = (elms: Element[]): string => {
    return Arr.map(elms, (el) => el.dom().outerHTML).join('');
  };

  Jsc.assert(composeParseProperty, {
    size: 500,
    tests: 500,
    quiet: true
  });

  // Manual testing. To simplify debugging once a counterexample has been found.
  /* const inputEntries: Entry[] = [
    {
      depth: 2,
      content: [Element.fromHtml('<i>stuff</i>')],
      listType: ListType.OL,
      isSelected: false,
      listAttributes: {style: 'list-style-type: lower-alpha;'},
      itemAttributes: {}
    }
  ];
  throw composeParse(inputEntries); */
});