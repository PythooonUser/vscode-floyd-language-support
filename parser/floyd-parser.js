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
  define() {}
  reserve() {}
  find() {}
  pop() {}
}

let Symbol = {
  id: null,
  value: null,
  lbp: null,
  position: null,
  assignment: false,
  nud: function() {
    Context.Errors.push({
      message: "Undefined",
      position: this.position
    });
  },
  led: function(left) {
    Context.Errors.push({
      message: "Missing operator",
      position: this.position
    });
  },
  std: null
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
      prototypeSymbol = Context.Scope.find(value);
    } else if (arity === "operator") {
      prototypeSymbol = Context.SymbolTable[value];
      if (!prototypeSymbol) {
        Context.Errors.push({
          message: "Unkown operator",
          position: token.position
        });
      }
    } else if (arity === "integer" || arity === "string") {
      arity = "literal";
      prototypeSymbol = Context.SymbolTable["(literal)"];
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
  definitions: function() {},
  expression: function(rbp) {
    let token = Context.Token;
    Parse.advance();
    let left = token.nud();

    while (rbp < Context.Token.lbp) {
      token = Context.Token;
      Parse.advance();
      left = token.led(left);
    }

    return left;
  },
  statement: function() {
    let token = Context.Token;

    if (token.std) {
      Parse.advance();
      Context.Scope.reserve(token);
      return token.std();
    }

    let expression = Parse.expression(0);
    if (!expression.assignment && expression.id !== "(") {
      Context.Errors.push({
        message: "Bad expression statement",
        position: expression.position
      });
    }

    Parse.advance(";");
    return expression;
  },
  statements: function() {
    let statements = [];

    while (true) {
      if (Context.Token.id === "}" || Context.Token.id === "(end)") {
        break;
      }

      let statement = Parse.statement();
      if (statement) {
        statements.push(statement);
      }
    }

    return statements.length === 0
      ? null
      : statements.length === 1
      ? statements[0]
      : statements;
  },
  block: function() {
    let token = Context.Token;
    Parse.advance("{");
    return token.std();
  }
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
  },
  Infix: function(id, bp, led) {
    let symbol = Define.Symbol(id, bp);

    symbol.led =
      led ||
      function(left) {
        this.first = left;
        this.second = Parse.expression(bp);
        this.arity = "binary";
        return this;
      };

    return symbol;
  },
  Infixr: function(id, bp, led) {
    let symbol = Define.Symbol(id, bp);

    symbol.led =
      led ||
      function(left) {
        this.first = left;
        this.second = Parse.expression(bp - 1);
        this.arity = "binary";
        return this;
      };

    return symbol;
  },
  Prefix: function(id, nud) {
    let symbol = Define.Symbol(id);

    symbol.nud =
      nud ||
      function() {
        Context.Scope.reserve(this);
        this.first = Parse.expression(70);
        this.arity = "unary";
        return this;
      };

    return symbol;
  },
  Assignment: function(id) {
    return Define.Infixr(id, 10, function(left) {
      if (left.id !== "." && left.id !== "[" && left.arity !== "name") {
        Context.Errors.push({
          message: "Bad left value",
          position: left.position
        });
      }

      this.first = left;
      this.second = Parse.expression(9);
      this.assignment = true;
      this.arity = "binary";

      return this;
    });
  },
  Constant: function(id, value) {
    let symbol = Define.Symbol(id);

    symbol.nud = function() {
      Context.Scope.reserve(this);
      this.value = Context.SymbolTable[this.id].value;
      this.arity = "literal";
      return this;
    };

    symbol.value = value;
    return symbol;
  },
  Statement: function(id, std) {
    let symbol = Define.Symbol(id);
    symbol.std = std;
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

Define.Infix("+", 50);
Define.Infix("-", 50);
Define.Infix("*", 60);
Define.Infix("/", 60);

Define.Infix("==", 40);
Define.Infix("!=", 40);
Define.Infix("<", 40);
Define.Infix("<=", 40);
Define.Infix(">", 40);
Define.Infix(">=", 40);

Define.Infix("?", 20, function(left) {
  this.first = left;
  this.seconf = Parse.expression(0);
  Parse.advance(":");
  this.third = Parse.expression(0);
  this.arity = "ternary";
  return this;
});

Define.Infix(".", 80, function(left) {
  this.first = left;

  if (Context.Token.arity !== "name") {
    Context.Errors.push({
      message: "Expected a property name",
      position: Context.Token.position
    });
  }

  Context.Token.arity = "literal";
  this.second = Context.Token;
  this.arity = "binary";
  Parse.advance();
  return this;
});

Define.Infix("[", 80, function(left) {
  this.first = left;
  this.second = Parse.expression(0);
  this.arity = "binary";
  Parse.advance("]");
  return this;
});

Define.Infixr("&&", 30);
Define.Infixr("||", 30);

Define.Prefix("-");
Define.Prefix("!");

Define.Prefix("(", function() {
  let expression = Parse.expression(0);
  Parse.advance(")");
  return expression;
});

Define.Assignment("=");
Define.Assignment("+=");
Define.Assignment("-=");
Define.Assignment("*=");
Define.Assignment("/=");

Define.Constant("NULL", null);
Define.Symbol("(literal)").nud = function() {
  return this;
};

Define.Statement("{", function() {
  new Scope();
  let statements = Parse.statements();
  Parse.advance("}");
  Context.Scope.pop();
  return statements;
});

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
