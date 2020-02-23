const Lexer = require("./floyd-lexer").Lexer;

let lexer;

let Context = {
  Token: null,
  PreviousToken: null,
  SymbolTable: {},
  Symbols: [],
  Scope: null,
  Errors: []
};

class Scope {
  constructor(parent) {
    this.definitions = {};
    this.parent = parent || Context.Scope;

    Context.Scope = this;
  }

  define(symbol) {
    let definition = this.definitions[symbol.value];
    if (definition) {
      if (definition.reserved) {
        Context.Errors.push({
          message: "Already reserved",
          position: definition.position
        });
      } else {
        Context.Errors.push({
          message: "Already defined",
          position: definition.position
        });
      }
    }

    this.definitions[symbol.value] = symbol;
    symbol.reserved = false;
    symbol.nud = function() {
      return this;
    };
    symbol.led = null;
    symbol.std = null;
    symbol.lbp = 0;
    symbol.scope = Context.Scope;

    return symbol;
  }

  reserve(symbol) {
    if (symbol.arity !== "name" || symbol.reserved) {
      return;
    }

    let definition = this.definitions[symbol.value];
    if (definition) {
      if (definition.reserved) {
        return;
      }
      if (definition.arity === "name") {
        Context.Errors.push({
          message: "Already defined",
          position: symbol.position
        });
      }
    }

    this.definitions[symbol.value] = symbol;
    symbol.reserved = true;
  }

  find(id) {
    let scope = this;

    while (true) {
      let symbol = scope.definitions[id];
      if (symbol) {
        return symbol;
      }

      scope = scope.parent;
      if (!scope) {
        symbol = Context.SymbolTable[id];
        return symbol !== undefined ? symbol : Context.SymbolTable["(name)"];
      }
    }
  }

  pop() {
    Context.Scope = this.parent;
  }
}

let Symbol = {
  id: null,
  value: null,
  lbp: null,
  position: null,
  assignment: false,
  reserved: false,
  scope: null,
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

    while (true) {
      if (
        token !== undefined &&
        (token.type === "comment" ||
          token.type === "whitespace" ||
          token.type === "directive")
      ) {
        token = lexer.lex();
      } else {
        break;
      }
    }

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

    Context.PreviousToken = Context.Token;

    Context.Token = { ...prototypeSymbol };
    Context.Token.arity = arity;
    Context.Token.value = value;
    Context.Token.position = token.position;

    return Context.Token;
  },
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
  },
  function: function(type, name) {
    Context.Scope.define(name);
    name.arity = "function";
    name.name = name.value;
    name.type = type.value;

    Parse.advance("(");
    new Scope();
    let parameters = [];

    if (Context.Token.id !== ")") {
      while (true) {
        let parameterType = Context.Token;

        if (
          parameterType.value !== "int" &&
          parameterType.value !== "string" &&
          parameterType.value !== "object"
        ) {
          Context.Errors.push({
            message: `[floyd] Invalid parameter type '${parameterType.value}'. Use either int, string or object.`,
            position: parameterType.position
          });
        }

        Parse.advance();
        let parameterName = Context.Token;

        if (parameterName.arity !== "name") {
          Context.Errors.push({
            message: "[floyd] Expected parameter name.",
            position: parameterName.position
          });
        }

        parameterName.type = parameterType.value;
        Context.Scope.define(parameterName);
        parameters.push(parameterName);

        Parse.advance();
        if (Context.Token.id !== ",") {
          break;
        }

        Parse.advance(",");
      }
    }

    name.first = parameters;

    Parse.advance(")");
    name.second = Parse.block();
    Context.Scope.pop();

    return name;
  },
  variable: function(type, name) {
    let definitions = [];
    let first = true;

    while (true) {
      let token = null;

      if (first) {
        token = name;
      } else {
        token = Context.Token;

        if (token.arity !== "name") {
          Context.Errors.push({
            message: "Expected variable name",
            position: token.position
          });
        }
      }

      token.type = type.value;
      Context.Scope.define(token);

      if (!first) {
        Parse.advance();
      } else {
        first = false;
      }

      if (Context.Token.id === "=") {
        let definition = Context.Token;
        Parse.advance("=");
        definition.first = token;
        definition.second = Parse.expression(0);
        definition.arity = "binary";
        definitions.push(definition);
      }

      if (Context.Token.id !== ",") {
        break;
      }

      Parse.advance(",");
    }

    Parse.advance(";");

    return definitions.length === 0
      ? null
      : definitions.length === 1
      ? definitions[0]
      : definitions;
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

Define.Infix("(", 80, function(left) {
  let expressions = [];

  if (left.id === "." || left.id === "[") {
    this.arity = "ternary";
    this.first = left.first;
    this.second = left.second;
    this.third = expressions;
  } else {
    this.arity = "binary";
    this.first = left;
    this.second = expressions;

    if (
      (left.arity !== "unary" || left.id !== "function") &&
      left.arity !== "name" &&
      left.id !== "(" &&
      left.id !== "&&" &&
      left.id !== "||" &&
      left.id !== "?"
    ) {
      Context.Errors.push({
        message: `[floyd] Expected a variable name.`,
        position: left.position
      });
    }
  }

  if (Context.Token.id !== ")") {
    while (true) {
      expressions.push(Parse.expression(0));
      if (Context.Token.id !== ",") {
        break;
      }
      Parse.advance(",");
    }
  }

  Parse.advance(")");
  return this;
});

Define.Statement("verb", function() {
  Parse.advance("(");

  if (Context.Token.arity !== "literal") {
    Context.Errors.push({
      message: `[floyd] Expected string literal.`,
      position: Context.Token.position
    });
  }

  this.first = Context.Token;

  Parse.advance();
  Parse.advance(",");

  if (Context.Token.arity !== "name") {
    Context.Errors.push({
      message: `[floyd] Expected action identifier.`,
      position: Context.Token.position
    });
  }

  this.second = Context.Token;

  Parse.advance();
  Parse.advance(",");

  if (Context.Token.arity !== "literal") {
    Context.Errors.push({
      message: `[floyd] Expected integer literal.`,
      position: Context.Token.position
    });
  }

  this.third = Context.Token;

  Parse.advance();
  Parse.advance(")");
  Parse.advance(";");

  return this;
});

Define.Statement("(name)", function() {
  let type = Context.PreviousToken;
  if (
    type.value !== "void" &&
    type.value !== "int" &&
    type.value !== "string" &&
    type.value !== "object"
  ) {
    Context.Errors.push({
      message: `[floyd] Invalid type '${type.value}'. Use either void, int, string or object.`,
      position: type.position
    });
  }

  let name = Context.Token;
  if (name.arity !== "name") {
    Context.Errors.push({
      message: `[floyd] Expected ${
        type.value === "void" ? "function" : "variable or function"
      } name. Got '${name.value}'.`,
      position: type.position
    });
  }

  Parse.advance();
  if (Context.Token.value === "(") {
    return Parse.function(type, name);
  } else {
    return Parse.variable(type, name);
  }
});

Define.Statement("class", function() {
  let abstract = false;

  if (Context.Token.value === "abstract") {
    Context.Scope.reserve(Context.Token);
    abstract = true;
    Parse.advance();
  }

  let token = Context.Token;
  if (token.arity !== "name") {
    Context.Errors.push({
      message: "[floyd] Expected class name",
      position: token.position
    });
  }

  Context.Scope.define(token);
  token.arity = "class";
  token.abstract = abstract;

  Parse.advance();
  let superClass = null;
  if (Context.Token.value === ":") {
    Parse.advance(":");
    if (Context.Token.arity !== "name") {
      Context.Errors.push({
        message: "[floyd] Expected super class name",
        position: Context.Token.position
      });
    }
    superClass = Context.Token;
    Parse.advance();
  }

  token.first = superClass;
  token.second = Parse.block();

  return token;
});

Define.Statement("return", function() {
  if (Context.Token.id !== ";") {
    this.first = Parse.expression(0);
  }

  Parse.advance(";");

  if (Context.Token.id !== "}") {
    Context.Errors.push({
      message: "[floyd] Unreachable code.",
      position: Context.Token.position
    });
  }

  this.arity = "statement";
  return this;
});

Define.Statement("while", function() {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(")");
  this.second = Parse.block();
  this.arity = "statement";
  return this;
});

let parse = function({ program }) {
  lexer = Lexer();
  lexer.setInput(program);

  Context = {
    Token: null,
    PreviousToken: null,
    SymbolTable: { ...Context.SymbolTable },
    Symbols: [],
    Scope: new Scope(),
    Errors: []
  };

  Parse.advance();
  const ast = Parse.statements();
  const scope = Context.Scope;
  Context.Scope.pop();

  return { ast, scope, symbols: Context.Symbols, errors: Context.Errors };
};

exports.parse = parse;
