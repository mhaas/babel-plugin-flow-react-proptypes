const content = `
import type {TestType} from './test-types.js.transpiled';

import React from 'react';
import renderer from 'react-test-renderer';

type FooProps = TestType & {
  foo: string,
  bar: number,
};

class C extends React.Component {
    props: FooProps
    
    render() { return <div/> };
}
  const tree1 = renderer.create(
    <C/>
  );`;

const utils = require('./lib/render-component');

it('intersection-with-imported-object-generates-warnings', () => {
  const path = require('path');
  const errorsSeen = utils.getConsoleErrorsForComponent(content, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});

