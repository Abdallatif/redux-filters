/* eslint-disable */

var fs = require("fs");
var Parser = require("jison").Parser;

function code(args, skipParentheses) {
  var argsJs = args.map(function(a) {
    return typeof(a) == 'number' ? ('$' + a) : JSON.stringify(a);
  }).join(',');

  return skipParentheses
    ? '$$ = [' + argsJs + '];'
    : '$$ = ["(", ' + argsJs + ', ")"];';
}

var grammar = {
  // Lexical tokens
  lex: {
    rules: [
      ['\\*', 'return "*";'],
      ['\\/', 'return "/";'],
      ['-'  , 'return "-";'],
      ['\\+', 'return "+";'],
      ['\\^', 'return "^";'],
      ['\\%', 'return "%";'],
      ['\\(', 'return "(";'],
      ['\\)', 'return ")";'],
      ['\\,', 'return ",";'],
      ['==', 'return "==";'],
      ['\\!=', 'return "!=";'],
      ['\\~=', 'return "~=";'],
      ['>=', 'return ">=";'],
      ['<=', 'return "<=";'],
      ['<', 'return "<";'],
      ['>', 'return ">";'],
      ['\\?', 'return "?";'],
      ['\\:', 'return ":";'],
      ['and[^\\w]', 'return "and";'],
      ['or[^\\w]' , 'return "or";'],
      ['not[^\\w]', 'return "not";'],
      ['in[^\\w]', 'return "in";'],

      ['\\s+',  ''], // skip whitespace
      ['[0-9]+(?:\\.[0-9]+)?\\b', 'return "NUMBER";'], // 212.321
      ['[a-zA-Z][\\.a-zA-Z0-9_]*', 'return "SYMBOL";'], // some.Symbol22
      ['\'(?:[^\'])*\'', 'yytext = yytext.substr(1, yyleng-2); return "SYMBOL";'], // 'some-symbol'
      ['"(?:[^"])*"', 'yytext = yytext.substr(1, yyleng-2); return "STRING";'], // "foo"

      // End
      ['$', 'return "EOF";'],
    ]
  },
  // Operator precedence - lowest precedence first.
  // See http://www.gnu.org/software/bison/manual/html_node/Precedence.html
  // for a good explanation of how it works in Bison (and hence, Jison).
  // Different languages have different rules, but this seems a good starting
  // point: http://en.wikipedia.org/wiki/Order_of_operations#Programming_languages
  operators: [
    ['left', '?', ':'],
    ['left', 'or'],
    ['left', 'and'],
    ['left', 'in'],
    ['left', '==', '!=', '~='],
    ['left', '<', '<=', '>', '>='],
    ['left', '+', '-'],
    ['left', '*', '/', '%'],
    ['left', '^'],
    ['left', 'not'],
    ['left', 'UMINUS'],
  ],
  // Grammar
  bnf: {
    expressions: [ // Entry point
      ['e EOF', 'return $1;']
    ],
    e: [
      ['e + e'  , code([1, '+', 3])],
      ['e - e'  , code([1, '-', 3])],
      ['e * e'  , code([1, '*', 3])],
      ['e / e'  , code([1, '/', 3])],
      ['e % e'  , code([1, '%', 3])],
      ['e ^ e'  , code(['Math.pow(', 1, ',', 3, ')'])],
      ['- e'  , code(['-', 2]), {prec: 'UMINUS'}],
      ['e and e', code(['Number(', 1, '&&', 3, ')'])],
      ['e or e' , code(['Number(', 1, '||', 3, ')'])],
      ['not e'  , code(['Number(!', 2, ')'])],
      ['e == e' , code(['Number(', 1, '==', 3, ')'])],
      ['e != e' , code(['Number(', 1, '!=', 3, ')'])],
      ['e ~= e' , code(['RegExp(', 3, ').test(', 1, ')'])],
      ['e < e'  , code(['Number(', 1, '<' , 3, ')'])],
      ['e <= e' , code(['Number(', 1, '<=', 3, ')'])],
      ['e > e'  , code(['Number(', 1, '> ', 3, ')'])],
      ['e >= e' , code(['Number(', 1, '>=', 3, ')'])],
      ['e ? e : e', code([1, '?', 3, ':', 5])],
      ['( e )'  , code([2])],
      ['NUMBER' , code([1])],
      ['STRING' , code(['"', 1, '"'])],
      ['SYMBOL' , code(['data["', 1, '"]'])],
      ['SYMBOL ( )', code(['(functions.hasOwnProperty("', 1, '") ? functions.', 1, '() : unknown("', 1, '"))'])],
      ['SYMBOL ( argsList )', code(['(functions.hasOwnProperty("', 1, '") ? functions.', 1, '(', 3, ') : unknown("', 1, '"))'])],
      ['e in ( inSet )', code([1, ' in (function(o) { ', 4, 'return o; })({})'])],
      ['e not in ( inSet )', code(['!(', 1, ' in (function(o) { ', 5, 'return o; })({}))'])],
    ],
    argsList: [
      ['e', code([1], true)],
      ['argsList , e', code([1, ',', 3], true)],
    ],
    inSet: [
      ['e', code(['o[', 1, '] = true; '], true)],
      ['inSet , e', code([1, 'o[', 3, '] = true; '], true)],
    ],
  }
};
let parser = new Parser(grammar);
var parserSource = parser.generate();
fs.writeFile(__dirname + '/parse.js', parserSource, 'utf8', function(err) {
  if(err) {
    return console.log(err);
  }

  console.log("The file was saved!");
});


// export default function filtrexParser() {
//   }
//
// export function generateToFile(){
//
//   let parser = filtrexParser();
//   var parserSource = parser.generate();
//
//   fs.writeFile(__dirname + '/parse.js', parserSource, 'utf8', function(err) {
//     if(err) {
//       return console.log(err);
//     }
//
//     console.log("The file was saved!");
//   });
//
// }
