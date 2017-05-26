// Note: The code processing this literal is in a subdir, so the import has to be relative
// to the subdir!
const content = `
import type {NestedType, TestType} from './test-types.js.transpiled';

import React from 'react';
import renderer from 'react-test-renderer';

type FooProps = NestedType & {
  foo: string,
  bar: number,
  nested_intersection: {a1: string, a2: string } & NestedType & {a3: string} & TestType,
} & TestType;

class C extends React.Component {
    props: FooProps
    
    render() { return <div/> };
}
`;

const utils = require('./lib/render-component');

it('intersection-with-imported-object-generates-warnings: no prop types given', () => {
  const path = require('path');

  const componentRenderCall = 'renderer.create(<C/>);';
  const fullTest = content + componentRenderCall;

  const errorsSeen = utils.getConsoleErrorsForComponent(fullTest, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});

it('intersection-with-imported-object-generates-warnings: null given for nested shape quy', () => {
  const path = require('path');

  const componentRenderCall = 'renderer.create(<C quy={null}/>);';
  const fullTest = content + componentRenderCall;

  const errorsSeen = utils.getConsoleErrorsForComponent(fullTest, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});


it('intersection-with-imported-object-generates-warnings: invalid value given for key quy.baz', () => {
  const path = require('path');

  const componentRenderCall = 'renderer.create(<C quy={{baz: 5}}/>);';
  const fullTest = content + componentRenderCall;

  const errorsSeen = utils.getConsoleErrorsForComponent(fullTest, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});


it('intersection-with-imported-object-generates-warnings: test deeper nested type quz: missing bar: TestType ', () => {
  const path = require('path');
  const componentRenderCall = 'renderer.create(<C quz={{foo: 5}}/>);';
  const fullTest = content + componentRenderCall;

  const errorsSeen = utils.getConsoleErrorsForComponent(fullTest, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});

it('intersection-with-imported-object-generates-warnings: test deeper nested type quz.bar: specified with wrong type ', () => {
  const path = require('path');
  // quz.bar.baz must be string, not number
  const componentRenderCall = 'renderer.create(<C quz={{foo: 5, bar: {baz: 5}}}/>);';
  const fullTest = content + componentRenderCall;

  const errorsSeen = utils.getConsoleErrorsForComponent(fullTest, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});

it('intersection-with-imported-object-generates-warnings: No warnings, all props given correctly', () => {
  const path = require('path');
  // quz.bar.baz must be string, not number

  const componentRenderCall = `
renderer.create(<C
    qux={5}
    quy={ {baz: "string"} }
    quz={ {foo: 5, bar: {baz: "string"}} }
    foo="string"
    bar={1}
    baz="string"
    nested_intersection={
      {a1: "string",
       a2: "string",
       qux: 5,
       quy: { baz: "string"},
       quz: {foo: 5, bar: { baz: "string" } },
       a3: "string",
       baz: "string"}
    }
/>);`;
  const fullTest = content + componentRenderCall;

  const errorsSeen = utils.getConsoleErrorsForComponent(fullTest, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});


