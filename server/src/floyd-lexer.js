const Lexer = require("lex");

exports.Lexer = function () {
  let line = 0;
  let character = 0;
  let lastPosition = { line, character };
  let currentPosition = { line, character };

  let updatePosition = function (lexeme) {
    lastPosition = currentPosition;

    for (let i = 0; i < lexeme.length; i++) {
      if (lexeme[i] === "\n") {
        line += 1;
        character = 0;
      } else {
        character += 1;
      }
    }

    currentPosition = { line, character };
  };

  let createToken = function (type, value) {
    return {
      type: type,
      value: value,
      range: { start: lastPosition, end: currentPosition },
    };
  };

  let processLexeme = function (type) {
    return function (lexeme) {
      updatePosition(lexeme);
      if (type) return createToken(type, lexeme);
    };
  };

  const lexer = new Lexer();

  lexer.addRule(/\/\*(\*(?!\/)|[^*])*\*\//, processLexeme());
  lexer.addRule(/\/\/[^\r\n]*/, processLexeme());
  lexer.addRule(/[a-zA-Z_][a-zA-Z0-9_]*/, processLexeme("name"));
  lexer.addRule(/[0-9]+/, processLexeme("integer"));
  lexer.addRule(/"[^"]*"/, processLexeme("string"));
  lexer.addRule(
    /#(include|ifdef|ifndef|endif)[^\r\n]*/,
    processLexeme("directive")
  );
  lexer.addRule(/#define/, processLexeme("define"));
  lexer.addRule(
    /<<|>>|\+\+|--|&&|&|\|\||\||\^|<=|>=|<|>|!=|==|!|~|%=|\/=|\*=|\+=|-=|\+|-|%|\/|\*|=|\(|\)|{|}|\[|\]|,|:|\?|;|\./,
    processLexeme("operator")
  );
  lexer.addRule(/[\s]+/, processLexeme());
  lexer.addRule(/./, processLexeme("invalid"));

  return lexer;
};
