/* eslint-disable */

import _get from "lodash/get";
import _includes from "lodash/includes";
import _find from "lodash/find";

import compileExpression from "./compiler";

// define custom functions
const get = (obj, path) => _get(obj, path);
const includes = (obj, value) => _includes(obj, value);
const find = (obj, key, value) => _find(obj, { [key]: value }) !== undefined;
const contains = (obj, key, value) => !!_find(obj, item => _includes(item, key));

const compile = exp => compileExpression(exp, { get, includes, find, contains });
export default compile;
