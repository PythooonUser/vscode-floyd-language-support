const Lexer = require("./floyd-lexer").Lexer;

let lexer;

let parse = function({ program }) {
  return { errors: [] };
};

exports.parse = parse;
