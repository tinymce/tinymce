define(
  'ephox.sugar.api.node.NodeTypes',

  [

  ],

  function () {
    return {
      ATTRIBUTE:              2,
      CDATA_SECTION:          4,
      COMMENT:                8,
      DOCUMENT:               9,
      DOCUMENT_TYPE:          10,
      DOCUMENT_FRAGMENT:      11,
      ELEMENT:                1,
      TEXT:                   3,
      PROCESSING_INSTRUCTION: 7,
      ENTITY_REFERENCE:       5,
      ENTITY:                 6,
      NOTATION:               12
    };
  }
);