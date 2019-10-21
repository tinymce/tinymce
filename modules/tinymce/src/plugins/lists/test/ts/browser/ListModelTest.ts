import { Arbitraries } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';
import { composeList } from 'tinymce/plugins/lists/listModel/ComposeList';
import { Entry } from 'tinymce/plugins/lists/listModel/Entry';
import { normalizeEntries } from 'tinymce/plugins/lists/listModel/NormalizeEntries';
import { parseLists } from 'tinymce/plugins/lists/listModel/ParseLists';
import { ListType } from 'tinymce/plugins/lists/listModel/Util';

UnitTest.test('tinymce.lists.browser.ListModelTest', () => {
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
    return isEqualEntries(inputEntries, outputEntries) || errorMessage(inputEntries, outputEntries);
  });

  const composeParse = (entries: Entry[]): Entry[] => {
    return composeList(document, entries)
      .map((list) => parseLists([list], Option.none()))
      .bind(Arr.head)
      .map((entrySet) => entrySet.entries)
      .getOr([]);
  };

  const isEqualEntries = (a: Entry[], b: Entry[]): boolean => {
    return stringifyEntries(a) === stringifyEntries(b);
  };

  const errorMessage = (inputEntries: Entry[], outputEntries: Entry[]): string => {
    return `\nPretty print counterexample:\n` +
    `input: [${stringifyEntries(inputEntries)}\n]\n` +
    `output: [${stringifyEntries(outputEntries)}\n]`;
  };

  const stringifyEntries = (entries: Entry[]): string => {
    return Arr.map(entries, stringifyEntry).join(',');
  };

  const stringifyEntry = (entry: Entry): string => {
    return `\n  {
      depth: ${entry.depth}
      content: ${entry.content.length > 0 ? serializeElements(entry.content) : '[Empty]'}
      listType: ${entry.listType}
      isSelected: ${entry.isSelected}
      listAttributes: ${JSON.stringify(entry.listAttributes)}
      itemAttributes: ${JSON.stringify(entry.itemAttributes)}
    }`;
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
