import { document } from '@ephox/dom-globals';
import { Class, Element, Elements, Html, Insert, InsertAll, Remove } from '@ephox/sugar';

const init = function (name, f) {
  const container = Element.fromTag('div');
  Class.add(container, 'demo-container');
  Html.set(container, '<p>' + name + '</p>');

  const outcome = Element.fromTag('div');
  Html.set(outcome, 'Running ....');

  const success = function () {
    Class.add(outcome, 'success');
    Html.set(outcome, 'Success!');
  };

  // Taken from tunic
  const htmlentities = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  const keepMarkers = function (html) {
    return html.replace(/&lt;del&gt;/g, '<del>').replace(/&lt;\/del&gt;/g, '</del>').replace(/&lt;ins&gt;/g, '<ins>').replace(/&lt;\/ins&gt;/g, '</ins>');
  };

  const failure = function (err) {
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

export default <any> {
  init
};
