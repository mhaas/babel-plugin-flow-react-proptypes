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
  const tree1 = renderer.create(
    <C/>
  );`;

const utils = require('./lib/render-component');

/*
 * This test pretty much showcases that non-object exports are not working.
 * We would expect different errors.
 *
 * The test is currently passing, but serves more as documentation of existing issues
 * than of correct behavior.
 */

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
  // TODO: the message generated here is probably not useful - numberValue and enumStringValue
  // are apparently invalid, because they are not of type object.
  // Apparently, our fallback to 'any' (which we don't want here anyways)
  // causes this odd behavior.
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
