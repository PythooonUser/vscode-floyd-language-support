const Lexer = require("./floyd-lexer").Lexer;

let lexer;

let Context = {
  SymbolTable: {},
  Symbols: [],
  Scope: null,
  Errors: []
};

class Scope {
  pop() {}
}

let Symbol = {
  id: null,
  value: null,
  lbp: null,
  nud: function() {},
  led: function(left) {}
};

let Parse = {
  advance: function() {},
  definitions: function() {}
};

let Define = {
  Symbol: function(id, bp) {
    let symbol = Context.SymbolTable[id];
    bp = bp || 0;

    if (symbol) {
      if (bp >= symbol.lbp) {
        symbol.lbp = bp;
      }
    } else {
      symbol = { ...Symbol };
      symbol.id = symbol.value = id;
      symbol.lbp = bp;
      Context.SymbolTable[id] = symbol;
    }

    return symbol;
  }
};

Define.Symbol(":");
Define.Symbol(";");
Define.Symbol(",");
Define.Symbol(")");
Define.Symbol("]");
Define.Symbol("}");
Define.Symbol("else");

Define.Symbol("(name)");
Define.Symbol("(end)");

let parse = function({ program }) {
  lexer = Lexer();
  lexer.setInput(program);

  Context = {
    SymbolTable: { ...Context.SymbolTable },
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
