const Lexer = require("./floyd-lexer").Lexer;

let lexer;

let Context = {
  Token: null,
  PreviousToken: null,
  SymbolTable: {},
  Symbols: [],
  Scope: null,
  Errors: [],
};

const Language = [
  "addExit",
  "addScores",
  "contentList",
  "darkness",
  "from",
  "getKey",
  "has",
  "in",
  "isLight",
  "issecond",
  "isverbose",
  "location",
  "menu",
  "moves",
  "moveto",
  "name",
  "objectsInside",
  "player",
  "random",
  "room",
  "scores",
  "serial",
  "setLong",
  "setNoun",
  "setPlayer",
  "setShort",
  "StatusLineFormat",
  "stopDaemon",
  "stopTimer",
  "strlen",
  "strstr",
  "to",
  "topic",
  "write",
];

let Error = {
  error: function (message, range) {
    this._diagnostic(message, range, 1);
  },
  warning: function (message, range) {
    this._diagnostic(message, range, 2);
  },
  information: function (message, range) {
    this._diagnostic(message, range, 3);
  },
  hint: function (message, range) {
    this._diagnostic(message, range, 4);
  },
  _diagnostic: function (message, range, severity) {
    Context.Errors.push({
      message: `${message}`,
      range: range,
      severity: severity,
    });
  },
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
        Error.error("Already reserved", definition.range);
      } else {
        Error.warning("Already defined", definition.range);
      }
    }

    this.definitions[symbol.value] = symbol;
    symbol.reserved = false;
    symbol.nud = function () {
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
        Error.warning("Already defined", symbol.range);
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
  range: null,
  assignment: false,
  reserved: false,
  scope: null,
  nud: function () {
    // Error.warning(`${this.value} is undefined`, this.range);
    this.scope = Context.Scope;
    Context.Symbols.push(this);
    return this;
  },
  led: function (left) {
    Error.error("Missing operator", this.range);
  },
  std: null,
};

let Parse = {
  advance: function (id) {
    if (id && Context.Token.id !== id) {
      Error.error(`Expected: ${id}`, Context.Token.range);
    }

    let token = lexer.lex();

    while (true) {
      if (
        token !== undefined &&
        (token.type === "comment" ||
          token.type === "whitespace" ||
          token.type === "directive" ||
          token.type === "invalid")
      ) {
        if (token.type === "invalid") {
          Error.error(`Invalid character '${token.value}'`, token.range);
        }
        token = lexer.lex();
      } else {
        break;
      }
    }

    Context.PreviousToken = Context.Token;

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
        Error.error("Unkown operator", token.range);
      }
    } else if (arity === "integer" || arity === "string") {
      arity = "literal";
      prototypeSymbol = Context.SymbolTable["(literal)"];
    } else {
      Error.error("Unexpected token", token.range);
    }

    Context.Token = { ...prototypeSymbol };
    Context.Token.arity = arity;
    Context.Token.value = value;
    Context.Token.range = token.range;

    return Context.Token;
  },
  expression: function (rbp) {
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
  attribute: function () {
    let token = Context.Token;

    if (token.id === "~") {
      Parse.advance();

      if (Context.Token.arity === "name") {
        token.first = Context.Token;
      }
    }

    Parse.advance();
    return token;
  },
  statement: function () {
    let token = Context.Token;

    if (token.std) {
      Parse.advance();
      Context.Scope.reserve(token);
      return token.std();
    }

    let expression = Parse.expression(0);
    Recovery.expectSemicolon();

    if (
      Context.PreviousToken.id === ";" &&
      !expression.assignment &&
      expression.id !== "("
    ) {
      Error.warning("Bad expression statement", {
        start: expression.range.start,
        end: Context.PreviousToken.range.end,
      });
    }

    return expression;
  },
  statements: function () {
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
  block: function () {
    let token = Context.Token;
    Parse.advance("{");
    return token.std();
  },
  function: function (type, name) {
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
          Error.error(
            `Invalid parameter type '${parameterType.value}'. Use either int, string or object.`,
            parameterType.range
          );
        }

        Parse.advance();
        let parameterName = Context.Token;

        if (parameterName.arity !== "name") {
          Error.error("Expected parameter name.", parameterName.range);
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
  variable: function (type, name) {
    let definitions = [];
    let first = true;

    while (true) {
      let token = null;

      if (first) {
        token = name;
      } else {
        token = Context.Token;

        if (token.arity !== "name") {
          Error.error("Expected variable name", token.range);
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
  },
};

class Recovery {
  static expectSemicolon() {
    if (Context.Token.id !== ";") {
      Error.error(
        `Missing semicolon`,
        Context.PreviousToken
          ? Context.PreviousToken.range
          : Context.Token.range
      );
    } else {
      Parse.advance(";");
    }
  }

  static advanceToNextToken(condition) {
    Error.error(
      `Unexpected token '${
        Context.Token.arity === "name" ? Context.Token.value : Context.Token.id
      }'`,
      Context.Token.range
    );

    while (condition(Context.Token) && Context.Token.id !== "(end)") {
      Parse.advance();
    }

    return Context.Token;
  }
}

class Analysis {
  static undefinedSymbols(symbols) {
    for (const symbol of symbols) {
      const definition = symbol.scope.find(symbol.value);
      if (
        definition.value !== symbol.value &&
        !Language.includes(symbol.value)
      ) {
        Error.warning(`${symbol.value} is undefined`, symbol.range);
      }
    }
  }
}

let Define = {
  Symbol: function (id, bp) {
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
  Infix: function (id, bp, led) {
    let symbol = Define.Symbol(id, bp);

    symbol.led =
      led ||
      function (left) {
        this.first = left;
        this.second = Parse.expression(bp);
        this.arity = "binary";
        return this;
      };

    return symbol;
  },
  Infixr: function (id, bp, led) {
    let symbol = Define.Symbol(id, bp);

    symbol.led =
      led ||
      function (left) {
        this.first = left;
        this.second = Parse.expression(bp - 1);
        this.arity = "binary";
        return this;
      };

    return symbol;
  },
  Prefix: function (id, nud) {
    let symbol = Define.Symbol(id);

    symbol.nud =
      nud ||
      function () {
        Context.Scope.reserve(this);
        this.first = Parse.expression(70);
        this.arity = "unary";
        return this;
      };

    return symbol;
  },
  Assignment: function (id) {
    return Define.Infixr(id, 10, function (left) {
      if (left.id !== "." && left.id !== "[" && left.arity !== "name") {
        Error.error("Bad left value", left.range);
      }

      this.first = left;
      this.second = Parse.expression(9);
      this.assignment = true;
      this.arity = "binary";

      return this;
    });
  },
  Constant: function (id, value) {
    let symbol = Define.Symbol(id);

    symbol.nud = function () {
      Context.Scope.reserve(this);
      this.value = Context.SymbolTable[this.id].value;
      this.arity = "literal";
      return this;
    };

    symbol.value = value;
    return symbol;
  },
  Statement: function (id, std) {
    let symbol = Define.Symbol(id);
    symbol.std = std;
    return symbol;
  },
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

Define.Symbol("this").nud = function () {
  Context.Scope.reserve(this);
  this.arity = "this";
  return this;
};

Define.Symbol("super").nud = function () {
  Context.Scope.reserve(this);
  this.arity = "super";
  return this;
};

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

Define.Infix("?", 20, function (left) {
  this.first = left;
  this.seconf = Parse.expression(0);
  Parse.advance(":");
  this.third = Parse.expression(0);
  this.arity = "ternary";
  return this;
});

Define.Infix(".", 80, function (left) {
  this.first = left;

  if (Context.Token.arity !== "name") {
    Error.error("Expected a property name", Context.Token.range);
  }

  Context.Token.arity = "literal";
  this.second = Context.Token;
  this.arity = "binary";
  Parse.advance();
  return this;
});

Define.Infix("[", 80, function (left) {
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
Define.Prefix("~");

Define.Prefix("(", function () {
  let expression = Parse.expression(0);
  Parse.advance(")");
  return expression;
});

Define.Assignment("=");
Define.Assignment("+=");
Define.Assignment("-=");
Define.Assignment("*=");
Define.Assignment("/=");

Define.Infix("++", 10, function (left) {
  this.first = left;
  this.assignment = true;
  this.arity = "unary";
  return this;
});

Define.Infix("--", 10, function (left) {
  this.first = left;
  this.assignment = true;
  this.arity = "unary";
  return this;
});

Define.Constant("NULL", null);
Define.Symbol("(literal)").nud = function () {
  return this;
};

Define.Statement("{", function () {
  new Scope();
  let statements = Parse.statements();
  Parse.advance("}");
  Context.Scope.pop();
  return statements;
});

Define.Infix("(", 80, function (left) {
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
      Error.error("Expected a variable name.", left.range);
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

Define.Statement("verb", function () {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(",");
  this.second = Parse.expression(0);
  Parse.advance(",");
  this.third = Parse.expression(0);
  Parse.advance(")");
  Recovery.expectSemicolon();

  this.arity = "verb";
  return this;
});

Define.Statement("class", function () {
  let abstract = false;

  if (Context.Token.value === "abstract") {
    Context.Scope.reserve(Context.Token);
    abstract = true;
    Parse.advance();
  }

  let token = Context.Token;
  if (token.arity !== "name") {
    Error.error("Expected class name", token.range);
  }

  Context.Scope.define(token);
  token.arity = "class";
  token.abstract = abstract;

  Parse.advance();
  let superClass = null;
  if (Context.Token.value === ":") {
    Parse.advance(":");
    if (Context.Token.arity !== "name") {
      Error.error("Expected super class name", Context.Token.range);
    }
    superClass = Context.Token;
    superClass.scope = Context.Scope;
    Context.Symbols.push(superClass);
    Parse.advance();
  }

  token.first = superClass;
  token.second = Parse.block();

  return token;
});

Define.Statement("return", function () {
  if (Context.Token.id !== ";") {
    this.first = Parse.expression(0);
  }

  Recovery.expectSemicolon();

  this.arity = "statement";
  return this;
});

Define.Statement("while", function () {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(")");
  this.second = Parse.block();
  this.arity = "statement";
  return this;
});

Define.Statement("do", function () {
  this.first = Parse.block();

  Parse.advance("while");
  Parse.advance("(");
  this.second = Parse.expression(0);
  Parse.advance(")");
  Recovery.expectSemicolon();

  this.arity = "statement";
  return this;
});

Define.Statement("if", function () {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(")");

  this.second = Parse.block();

  if (Context.Token.id === "else") {
    Context.Scope.reserve(Context.Token);
    Parse.advance("else");
    this.third = Parse.block();
  } else {
    this.third = null;
  }

  this.arity = "statement";
  return this;
});

Define.Statement("for", function () {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(";");
  this.second = Parse.expression(0);
  Parse.advance(";");
  this.third = Parse.expression(0);
  Parse.advance(")");

  this.forth = Parse.block();

  this.arity = "statement";
  return this;
});

Define.Statement("fetch", function () {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(",");
  this.second = Parse.expression(0);
  Parse.advance(",");
  this.third = Parse.expression(0);
  Parse.advance(")");

  this.forth = Parse.block();

  this.arity = "statement";
  return this;
});

Define.Statement("switch", function () {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(")");

  this.second = Parse.block();

  this.arity = "statement";
  return this;
});

Define.Statement("case", function () {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(")");
  Recovery.expectSemicolon();
  this.arity = "statement";
  return this;
});

Define.Statement("break", function () {
  Recovery.expectSemicolon();
  this.arity = "statement";
  return this;
});

Define.Statement("default", function () {
  Recovery.expectSemicolon();
  this.arity = "statement";
  return this;
});

Define.Statement("quit", function () {
  Recovery.expectSemicolon();
  this.arity = "statement";
  return this;
});

Define.Statement("halt", function () {
  Parse.advance("(");
  this.first = Parse.expression(0);
  Parse.advance(")");
  Recovery.expectSemicolon();
  this.arity = "statement";
  return this;
});

Define.Statement("int", function () {
  let name = Context.Token;
  Parse.advance();

  if (Context.Token.value === "(") {
    Context.Scope.define(name);
    name.arity = "function";

    Parse.advance("(");
    new Scope();
    let parameters = [];

    if (Context.Token.id !== ")") {
      while (true) {
        Parse.advance();
        Context.Scope.define(Context.Token);
        parameters.push(Context.Scope);

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
  } else {
    let definitions = [];
    let first = true;

    while (true) {
      let token = null;

      if (first) {
        token = name;
      } else {
        token = Context.Token;
      }

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
      } else if (Context.Token.id === "[") {
        Parse.advance("[");
        token.first = Parse.expression(0);
        Parse.advance("]");

        if (Context.Token.id === "=") {
          let definition = Context.Token;
          Parse.advance("=");
          definition.first = token;

          let elements = [];
          Parse.advance("(");
          if (Context.Token.id !== ")") {
            while (true) {
              elements.push(Parse.expression(0));
              if (Context.Token.id !== ",") {
                break;
              }
              Parse.advance(",");
            }
            Parse.advance(")");
          }
          definition.second = elements;

          definition.arity = "binary";
          definitions.push(definition);
        }
      }

      if (Context.Token.id !== ",") {
        break;
      }

      Parse.advance(",");
    }

    Recovery.expectSemicolon();

    return definitions.length === 0
      ? null
      : definitions.length === 1
      ? definitions[0]
      : definitions;
  }
});

Define.Statement("string", function () {
  let name = Context.Token;
  Parse.advance();

  if (Context.Token.value === "(") {
    Context.Scope.define(name);
    name.arity = "function";

    Parse.advance("(");
    new Scope();
    let parameters = [];

    if (Context.Token.id !== ")") {
      while (true) {
        Parse.advance();
        Context.Scope.define(Context.Token);
        parameters.push(Context.Scope);

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
  } else {
    let definitions = [];
    let first = true;

    while (true) {
      let token = null;

      if (first) {
        token = name;
      } else {
        token = Context.Token;
      }

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
      } else if (Context.Token.id === "[") {
        Parse.advance("[");
        token.first = Parse.expression(0);
        Parse.advance("]");

        if (Context.Token.id === "=") {
          let definition = Context.Token;
          Parse.advance("=");
          definition.first = token;

          let elements = [];
          Parse.advance("(");
          if (Context.Token.id !== ")") {
            while (true) {
              elements.push(Parse.expression(0));
              if (Context.Token.id !== ",") {
                break;
              }
              Parse.advance(",");
            }
            Parse.advance(")");
          }
          definition.second = elements;

          definition.arity = "binary";
          definitions.push(definition);
        }
      }

      if (Context.Token.id !== ",") {
        break;
      }

      Parse.advance(",");
    }

    Recovery.expectSemicolon();

    return definitions.length === 0
      ? null
      : definitions.length === 1
      ? definitions[0]
      : definitions;
  }
});

Define.Statement("object", function () {
  let name = Context.Token;
  Parse.advance();

  if (Context.Token.value === "(") {
    Context.Scope.define(name);
    name.arity = "function";

    Parse.advance("(");
    new Scope();
    let parameters = [];

    if (Context.Token.id !== ")") {
      while (true) {
        Parse.advance();
        Context.Scope.define(Context.Token);
        parameters.push(Context.Scope);

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
  } else {
    let definitions = [];
    let first = true;

    while (true) {
      let token = null;

      if (first) {
        token = name;
      } else {
        token = Context.Token;
      }

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
      } else if (Context.Token.id === "[") {
        Parse.advance("[");
        token.first = Parse.expression(0);
        Parse.advance("]");

        if (Context.Token.id === "=") {
          let definition = Context.Token;
          Parse.advance("=");
          definition.first = token;

          let elements = [];
          Parse.advance("(");
          if (Context.Token.id !== ")") {
            while (true) {
              elements.push(Parse.expression(0));
              if (Context.Token.id !== ",") {
                break;
              }
              Parse.advance(",");
            }
            Parse.advance(")");
          }
          definition.second = elements;

          definition.arity = "binary";
          definitions.push(definition);
        }
      }

      if (Context.Token.id !== ",") {
        break;
      }

      Parse.advance(",");
    }

    Recovery.expectSemicolon();

    return definitions.length === 0
      ? null
      : definitions.length === 1
      ? definitions[0]
      : definitions;
  }
});

Define.Statement("void", function () {
  let name = Context.Token;
  Context.Scope.define(name);
  name.arity = "function";

  Parse.advance();
  Parse.advance("(");

  new Scope();
  let parameters = [];

  if (Context.Token.id !== ")") {
    while (true) {
      Parse.advance();
      Context.Scope.define(Context.Token);
      parameters.push(Context.Scope);

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
});

Define.Statement("with", function () {
  this.arity = "statement";

  Parse.advance("(");

  let attributes = [];

  while (true) {
    if (Context.Token.id === ")" || Context.Token.id === "(end)") {
      break;
    }

    attributes.push(Parse.attribute());

    if (Context.Token.id !== ",") {
      break;
    }
    Parse.advance(",");
  }

  Parse.advance(")");

  this.first = attributes;
  if (attributes.length <= 0) {
    Error.warning("Empty with statement", {
      start: this.range.start,
      end: Context.PreviousToken.range.end,
    });
  }

  Parse.advance(";");

  return this;
});

exports.parse = function (program) {
  lexer = Lexer();
  lexer.setInput(program);

  Context = {
    Token: null,
    PreviousToken: null,
    SymbolTable: { ...Context.SymbolTable },
    Symbols: [],
    Scope: new Scope(),
    Errors: [],
  };

  Parse.advance();
  const ast = Parse.statements();
  const scope = Context.Scope;
  Context.Scope.pop();

  Analysis.undefinedSymbols(Context.Symbols);

  return { ast, scope, symbols: Context.Symbols, errors: Context.Errors };
};
