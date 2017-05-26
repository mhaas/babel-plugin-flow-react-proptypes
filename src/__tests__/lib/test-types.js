'use strict';

if (typeof exports !== 'undefined') {
  Object.defineProperty(exports, 'babelPluginFlowReactPropTypes_proptype_TestType', {
    value: {
      baz: require('prop-types').string.isRequired
    }
  });
}
if (typeof exports !== 'undefined') {
  Object.defineProperty(exports, 'babelPluginFlowReactPropTypes_proptype_NestedType', {
    value: {
      qux: require('prop-types').number.isRequired,
      quy: require('prop-types').shape({
        baz: require('prop-types').string.isRequired
      }).isRequired,
      quz: require('prop-types').shape({
        foo: require('prop-types').number.isRequired,
        bar: require('prop-types').shape({
          baz: require('prop-types').string.isRequired
        }).isRequired
      }).isRequired
    }
  });
}