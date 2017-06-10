const content = `
import React, { Component } from 'react';
import renderer from 'react-test-renderer';

import type { SomeNestedType } from './test-types.js.transpiled';

type Props = SomeNestedType;

class App extends Component {
  props: Props

  render() {
    const { nestedProperty } = this.props;

    return (
      <div className="App">
        <p className="App-intro">
          { JSON.stringify(nestedProperty, null, 4)}
        </p>
      </div>
    );
  }
}

export default App;
`;

const utils = require('./lib/render-component');

/*
 * Test case for 101: Exported object types should just work when used directly as proptypes.
 *
 */

it('imported-object-type-can-be-used-as-props: no warnings', () => {
  const path = require('path');
  const renderCall = 'renderer.create(<App stringValue="Test"/>);';
  const fullSource = content + renderCall;
  const errorsSeen = utils.getConsoleErrorsForComponent(fullSource, [
    [path.join(__dirname, 'lib', 'test-types.js.pre-transpile'),
      path.join(__dirname, 'lib', 'test-types.js.transpiled')]
  ]);
  expect(errorsSeen).toMatchSnapshot();
});
