import {$debug, makeLiteral, PLUGIN_NAME} from './util';
import * as t from 'babel-types';
import template from 'babel-template';

const USE_PROPTYPES_PACKAGE = true;

export default function makePropTypesAst(propTypeData) {
  if (propTypeData.type === 'shape-intersect-runtime') {
    return makePropTypesAstForShapeIntersectRuntime(propTypeData);
  }
  else if (propTypeData.type === 'raw') {
    return makePropType(propTypeData);

  }
  else {
    return makePropTypesAstForShape(propTypeData);
  }
};

function makePropTypesAstForShapeIntersectRuntime(propTypeData) {
  const propTypeObjects = [];
  propTypeData.properties.forEach(propTypeSpec => {
    if (propTypeSpec.type === 'raw') {
      let propTypeObject = makePropType(propTypeSpec);
            // This will just be a variable, referencing an import we
            // generated above. This variable may contain prop-types.any,
            // which will not work when used in an intersection.
      const importNode = makePropTypeImportNode();
      const anyNode =  t.memberExpression(importNode, t.identifier('any'));
      const testExpression = t.binaryExpression('===', propTypeObject, anyNode);
      propTypeObject = t.conditionalExpression(testExpression, t.objectExpression([]), propTypeObject);
      propTypeObjects.push(propTypeObject);
    }
    else if (propTypeSpec.type === 'shape') {
      propTypeObjects.push(makePropTypesAstForShape(propTypeSpec));
    }
    else if (propTypeSpec.type === 'shape-intersect-runtime') {
      // TODO: simplify all of this recursive code?
      propTypeObjects.push(makePropTypesAstForShapeIntersectRuntime(propTypeSpec));
    }
  });

  return t.callExpression(
        t.memberExpression(t.identifier('Object'),
            t.identifier('assign')
        ),
        [t.objectExpression([]), ...propTypeObjects]);

}

function makePropTypesAstForShape(propTypeData) {
  // TODO: this is almost duplicated with the shape handling below;
  // but this code does not generate require('prop-types')
  const rootProperties = propTypeData.properties.map(({key, value}) => {
    return t.objectProperty(
      t.identifier(key),
      makePropType(value)
    );
  });
  return t.objectExpression(rootProperties);
}

function makePropTypeImportNode() {
  if (USE_PROPTYPES_PACKAGE) {
    return t.callExpression(t.identifier('require'), [makeLiteral('prop-types')]);
  }
  else {
    const reactNode = t.callExpression(t.identifier('require'), [makeLiteral('react')]);
    return t.memberExpression(reactNode, t.identifier('PropTypes'));
  }
}
function makePropType(data, isExact) {

  const method = data.type;

  if (method === 'exact') {
    data.properties.isRequired = data.isRequired;
    return makePropType(data.properties, true);
  }

  let isRequired = true;
  let node = makePropTypeImportNode();

  if (method === 'any' || method === 'string' || method === 'number' || method === 'bool' || method === 'object' ||
      method === 'array' || method === 'func' || method === 'node') {
    node = t.memberExpression(node, t.identifier(method));
  }
  else if (method === 'raw') {
    node = t.identifier(data.value);
    isRequired = false;
  }
  else if (method === 'shape') {
    const shapeObjectProperties = data.properties.map(({key, value}) => {
      return t.objectProperty(t.identifier(key), makePropType(value));
    });
    if (isExact || data.isExact) {
      shapeObjectProperties.push(
        t.objectProperty(
          t.identifier('__exact__'),
          exactTemplate({
            '$props$': t.objectExpression(data.properties.map(({key}) => t.objectProperty(t.identifier(key), t.booleanLiteral(true))))
          }).expression
        )
      );
    }
    const shapeObjectLiteral = t.objectExpression(shapeObjectProperties);
    node = t.callExpression(
      t.memberExpression(node, t.identifier('shape')),
      [shapeObjectLiteral]
    );
  }
  else if (method === 'shape-intersect-runtime') {
    node = makePropTypesAstForShapeIntersectRuntime(data);
  }
  else if (method === 'arrayOf') {
    node = t.callExpression(
      t.memberExpression(node, t.identifier('arrayOf')),
      [makePropType(data.of)]
    );
  }
  else if (method === 'oneOf') {
    node = t.callExpression(
      t.memberExpression(node, t.identifier('oneOf')),
      [t.arrayExpression(data.options.map(makeLiteral))]
    );
  }
  else if (method === 'oneOfType') {
    node = t.callExpression(
      t.memberExpression(node, t.identifier('oneOfType')),
      [t.arrayExpression(data.options.map(makePropType))]
    );
  }
  else if (method === 'void') {
    node = dontSetTemplate().expression;
  }
  else {
    const bugData = JSON.stringify(data, null, 2);
    $debug('Unknown node ' + bugData);
    throw new Error(`${PLUGIN_NAME} processing error: This is an internal error that should never happen. ` +
      `Report it immediately with the source file and babel config. Data: ${bugData}`);
  }

  if (isRequired && data.isRequired && method !== 'void') {
    node = t.memberExpression(node, t.identifier('isRequired'));
  }

  return node;
}

const dontSetTemplate = template(`
(props, propName, componentName) => {
  if(props[propName] != null) return new Error(\`Invalid prop \\\`\${propName}\\\` of value \\\`\${value}\\\` passed to \\\`\${componentName\}\\\`. Expected undefined or null.\`);
}
`);

const exactTemplate = template(`
(values, prop, displayName) => {
  var props = $props$;
  var extra = [];
  for (var k in values) {
    if (values.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
      extra.push(k);
    }
  }
  if (extra.length > 0) {
    return new Error('Invalid additional prop(s) ' + JSON.stringify(extra));
  }
}
`);
