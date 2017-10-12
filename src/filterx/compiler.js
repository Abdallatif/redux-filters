/* eslint-disable */

import Parser from './parser';

export default function compileExpression(expression, extraFunctions /* optional */) {
  const functions = {
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    log: Math.log,
    max: Math.max,
    min: Math.min,
    random: Math.random,
    round: Math.round,
    sqrt: Math.sqrt,
  };
  if (extraFunctions) {
    for (const name in extraFunctions) {
      if (extraFunctions.hasOwnProperty(name)) {
        functions[name] = extraFunctions[name];
      }
    }
  }
  if (!compileExpression.parser) {
        // Building the original parser is the heaviest part. Do it
        // once and cache the result in our own function.
    compileExpression.parser = Parser;
  }

  const tree = compileExpression.parser.parse(expression);
  
  // console.log(expression, tree);

  const js = [];
  js.push('return ');
  function toJs(node) {
    if (Array.isArray(node)) {
      node.forEach(toJs);
    } else {
      js.push(node);
    }
  }
  tree.forEach(toJs);
  js.push(';');

  function unknown(funcName) {
    throw `Unknown function: ${funcName}()`;
  }
  
  const func = new Function('functions', 'data', 'unknown', js.join(''));

  return function (data) {
    return func(functions, data, unknown);
  };
}
