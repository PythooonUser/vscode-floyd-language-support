const Lexer = require("./floyd-lexer").Lexer;

let lexer;

let Context = {
  Symbols: [],
  Scope: null,
  Errors: []
};

class Scope {
  pop() {}
}

let Parse = {
  advance: function() {},
  definitions: function() {}
};

let parse = function({ program }) {
  lexer = Lexer();
  lexer.setInput(program);

  Context = {
    Symbols: [],
    Scope: new Scope(),
    Errors: []
  };

  Parse.advance();
  const ast = Parse.definitions();
  const scope = Context.Scope;
  Context.Scope.pop();

  return { ast, scope, symbols: Context.Symbols, errors: Context.Errors };
};

exports.parse = parse;
