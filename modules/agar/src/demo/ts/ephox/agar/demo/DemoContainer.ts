import { document } from '@ephox/dom-globals';
import { Class, Element, Elements, Html, Insert, InsertAll, Remove } from '@ephox/sugar';

export const init = (name: string, f: (success: () => void, failure: (err: any) => void) => Element[]): void => {
  const container = Element.fromTag('div');
  Class.add(container, 'demo-container');
  Html.set(container, '<p>' + name + '</p>');

  const outcome = Element.fromTag('div');
  Html.set(outcome, 'Running ....');

  const success = () => {
    Class.add(outcome, 'success');
    Html.set(outcome, 'Success!');
  };

  // Taken from tunic
  const htmlentities = (str: string): string =>
    String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const keepMarkers = (html: string): string =>
    html.replace(/&lt;del&gt;/g, '<del>').replace(/&lt;\/del&gt;/g, '</del>').replace(/&lt;ins&gt;/g, '<ins>').replace(/&lt;\/ins&gt;/g, '</ins>');

  const failure = (err: any): void => {
    Class.add(outcome, 'failure');
    Remove.empty(outcome);
    if (err.diff) {
      InsertAll.append(outcome, Elements.fromHtml(keepMarkers(htmlentities(err.diff.comparison))));
    } else {
      Insert.append(outcome, Element.fromText(err));
    }
  };

  Insert.append(container, outcome);

  const elements = f(success, failure);
  InsertAll.append(container, elements);
  Insert.append(Element.fromDom(document.body), container);
};
