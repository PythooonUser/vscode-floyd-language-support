const Lexer = require("./floyd-lexer").Lexer;

let lexer;

let Context = {
  Token: null,
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
  position: null,
  nud: function() {},
  led: function(left) {}
};

let Parse = {
  advance: function(id) {
    if (id && Context.Token.id !== id) {
      Context.Errors.push({
        message: `Expected: ${id}`,
        position: Context.Token.position
      });
    }

    let token = lexer.lex();
    if (!token) {
      Context.Token = Context.SymbolTable["(end)"];
      return Context.Token;
    }

    let arity = token.type;
    let value = token.value;

    let prototypeSymbol = null;

    if (arity === "name") {
    } else if (arity === "operator") {
    } else if (arity === "integer" || arity === "string") {
    } else {
      Context.Errors.push({
        message: "Unexpected token",
        position: token.position
      });
    }

    Context.Token = { ...prototypeSymbol };
    Context.Token.arity = arity;
    Context.Token.value = value;
    Context.Token.position = token.position;

    return Context.Token;
  },
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
    Token: null,
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
