import { document } from '@ephox/dom-globals';
import { Class, Element, Elements, Html, Insert, InsertAll, Remove } from '@ephox/sugar';

var init = function (name, f) {
  var container = Element.fromTag('div');
  Class.add(container, 'demo-container');
  Html.set(container, '<p>' + name + '</p>');

  var outcome = Element.fromTag('div');
  Html.set(outcome, 'Running ....');
    
  var success = function () {
    Class.add(outcome, 'success');
    Html.set(outcome, 'Success!');
  };

  // Taken from tunic
  var htmlentities = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var keepMarkers = function (html) {
    return html.replace(/&lt;del&gt;/g, '<del>').replace(/&lt;\/del&gt;/g, '</del>').replace(/&lt;ins&gt;/g, '<ins>').replace(/&lt;\/ins&gt;/g, '</ins>');
  };

  var failure = function (err) {
    Class.add(outcome, 'failure');
    Remove.empty(outcome);
    if (err.diff) InsertAll.append(outcome, Elements.fromHtml(keepMarkers(htmlentities(err.diff.comparison))));
    else Insert.append(outcome, Element.fromText(err));
  };

  Insert.append(container, outcome);

  var elements = f(success, failure);
  InsertAll.append(container, elements);
  Insert.append(Element.fromDom(document.body), container);
};

export default <any> {
  init: init
};