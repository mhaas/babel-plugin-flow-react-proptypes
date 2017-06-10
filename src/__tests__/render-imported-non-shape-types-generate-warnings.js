const content = `
import type {StringType, NumberType, EnumStringType} from './test-types.js.transpiled';

import React from 'react';
import renderer from 'react-test-renderer';

type FooProps = {
  stringValue: StringType,
  numberValue: NumberType,
  enumStringValue: EnumStringType,
};

class C extends React.Component {
    props: FooProps
    
    render() { return <div/> };
}
`;

const utils = require('./lib/render-component');

// TODO: this incorrectly generates no errors. The types are not marked as required!
it('imported-non-shape-generates-warnings: no props given', () => {
  const path = require('path');
  const renderCall = 'renderer.create(<C/>);';
  const fullSource = content + renderCall;
  const errorsSeen = utils.getConsoleErrorsForComponent(fullSource, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});


it('imported-non-shape-generates-warnings: incorrect types given', () => {
  const path = require('path');
  const renderCall = 'renderer.create(<C stringValue={5} numberValue="string" enumStringValue="incorrect"/>);';
  const fullSource = content + renderCall;
  const errorsSeen = utils.getConsoleErrorsForComponent(fullSource, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});

it('imported-non-shape-generates-warnings: correct types, no warning types given', () => {
  const path = require('path');
  const renderCall = 'renderer.create(<C stringValue="string" numberValue={5} enumStringValue="yes"/>);';
  const fullSource = content + renderCall;
  const errorsSeen = utils.getConsoleErrorsForComponent(fullSource, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});
