define(
  'ephox.sugar.api.node.Element',

  [
    'ephox.katamari.api.Fun',
    'global!Error',
    'global!console',
    'global!document'
  ],

  function (Fun, Error, console, document) {
    var fromHtml = function (html, scope) {
      var doc = scope || document;
      var div = doc.createElement('div');
      div.innerHTML = html;
      if (!div.hasChildNodes() || div.childNodes.length > 1) {
        console.error('HTML does not have a single root node', html);
        throw 'HTML must have a single root node';
      }
      return fromDom(div.childNodes[0]);
    };

    var fromTag = function (tag, scope) {
      var doc = scope || document;
      var node = doc.createElement(tag);
      return fromDom(node);
    };

    var fromText = function (text, scope) {
      var doc = scope || document;
      var node = doc.createTextNode(text);
      return fromDom(node);
    };

    var fromDom = function (node) {
      if (node === null || node === undefined) throw new Error('Node cannot be null or undefined');
      return {
        dom: Fun.constant(node)
      };
    };

    return {
      fromHtml: fromHtml,
      fromTag: fromTag,
      fromText: fromText,
      fromDom: fromDom
    };
  }
);
