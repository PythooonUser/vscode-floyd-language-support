let assert = require("assert");
let Lexer = require("../src/floyd-lexer").Lexer;

describe("Lexer", function () {
  let lexer;

  this.beforeEach(function () {
    lexer = Lexer();
  });

  this.afterEach(function () {
    lexer = null;
  });

  assert.tokenPositionsEqual = function (expected, actual) {
    assert.equal(
      expected.line,
      actual.line,
      "Token line positions should be equal."
    );
    assert.equal(
      expected.character,
      actual.character,
      "Token character positions should be equal."
    );
  };

  assert.tokenRangesEqual = function (expected, actual) {
    assert.tokenPositionsEqual(
      expected.start,
      actual.start,
      "Token start ranges should be equal."
    );
    assert.tokenPositionsEqual(
      expected.end,
      actual.end,
      "Token end ranges should be equal."
    );
  };

  assert.tokensEqual = function (expected, actual) {
    assert.equal(expected.type, actual.type, "Token types should be equal.");
    assert.equal(expected.value, actual.value, "Token values should be equal.");
    assert.tokenRangesEqual(
      expected.range,
      actual.range,
      "Token ranges should be equal."
    );
  };

  assert.tokenArraysEqual = function (expected, actual) {
    assert.equal(
      expected.length,
      actual.length,
      "Number of tokens should be equal."
    );

    for (let i = 0; i < expected.length; i++) {
      assert.tokensEqual(expected[i], actual[i]);
    }
  };

  let getToken = function (program) {
    lexer.setInput(program);

    return lexer.lex();
  };

  let getTokens = function (program) {
    lexer.setInput(program);

    let tokens = [];
    let token = lexer.lex();

    while (token) {
      tokens.push(token);
      token = lexer.lex();
    }

    return tokens;
  };

  describe("Directives", function () {
    it("Should handle #include directive", function () {
      const program = `#include <stditem.floyd>`;

      const expected = [
        {
          type: "directive",
          value: "#include <stditem.floyd>",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 24 }
          }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });

    it("Should handle #define directive", function () {
      const program = `#define A_EXAMINE 101`;

      const expected = [
        {
          type: "directive",
          value: "#define A_EXAMINE 101",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 21 }
          }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });

    it("Should handle #ifdef directive", function () {
      const program = `#ifdef A_EXAMINE`;

      const expected = [
        {
          type: "directive",
          value: "#ifdef A_EXAMINE",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 16 }
          }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });

    it("Should handle #ifndef directive", function () {
      const program = `#ifndef A_EXAMINE`;

      const expected = [
        {
          type: "directive",
          value: "#ifndef A_EXAMINE",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 17 }
          }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });

    it("Should handle #endif directive", function () {
      const program = `#endif`;

      const expected = [
        {
          type: "directive",
          value: "#endif",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 6 }
          }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });
  });

  describe("Names", function () {
    it("Should handle names", function () {
      const program = `testname test_name _testName testName0`;

      const expected = [
        {
          type: "name",
          value: "testname",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 8 }
          }
        },
        {
          type: "name",
          value: "test_name",
          range: {
            start: { line: 0, character: 9 },
            end: { line: 0, character: 18 }
          }
        },
        {
          type: "name",
          value: "_testName",
          range: {
            start: { line: 0, character: 19 },
            end: { line: 0, character: 28 }
          }
        },
        {
          type: "name",
          value: "testName0",
          range: {
            start: { line: 0, character: 29 },
            end: { line: 0, character: 38 }
          }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });
  });

  describe("Literals", function () {
    describe("Integers", function () {
      it("Should handle integers", function () {
        const program = `0 1 1234`;

        const expected = [
          {
            type: "integer",
            value: "0",
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 1 }
            }
          },
          {
            type: "integer",
            value: "1",
            range: {
              start: { line: 0, character: 2 },
              end: { line: 0, character: 3 }
            }
          },
          {
            type: "integer",
            value: "1234",
            range: {
              start: { line: 0, character: 4 },
              end: { line: 0, character: 8 }
            }
          }
        ];

        const actual = getTokens(program);

        assert.tokenArraysEqual(expected, actual);
      });
    });

    describe("Strings", function () {
      it("Should handle single-line strings", function () {
        const program = `"Hello World!"`;

        const expected = {
          type: "string",
          value: `"Hello World!"`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 14 }
          }
        };

        const actual = getToken(program);

        assert.tokensEqual(expected, actual);
      });

      it("Should handle multiline strings", function () {
        const program = `"Hello\nWorld!"`;

        const expected = {
          type: "string",
          value: `"Hello\nWorld!"`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 1, character: 7 }
          }
        };

        const actual = getToken(program);

        assert.tokensEqual(expected, actual);
      });
    });
  });

  describe("Operators", function () {
    it("Should handle operators", function () {
      const program = `<< >> ++ -- && & || | ^ <= >= < > != == ! ~ %= /= *= += -= + - % / * = ( ) { } [ ] , : ? ; .`;

      const expected = [
        {
          type: "operator",
          value: "<<",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 2 }
          }
        },
        {
          type: "operator",
          value: ">>",
          range: {
            start: { line: 0, character: 3 },
            end: { line: 0, character: 5 }
          }
        },
        {
          type: "operator",
          value: "++",
          range: {
            start: { line: 0, character: 6 },
            end: { line: 0, character: 8 }
          }
        },
        {
          type: "operator",
          value: "--",
          range: {
            start: { line: 0, character: 9 },
            end: { line: 0, character: 11 }
          }
        },
        {
          type: "operator",
          value: "&&",
          range: {
            start: { line: 0, character: 12 },
            end: { line: 0, character: 14 }
          }
        },
        {
          type: "operator",
          value: "&",
          range: {
            start: { line: 0, character: 15 },
            end: { line: 0, character: 16 }
          }
        },
        {
          type: "operator",
          value: "||",
          range: {
            start: { line: 0, character: 17 },
            end: { line: 0, character: 19 }
          }
        },
        {
          type: "operator",
          value: "|",
          range: {
            start: { line: 0, character: 20 },
            end: { line: 0, character: 21 }
          }
        },
        {
          type: "operator",
          value: "^",
          range: {
            start: { line: 0, character: 22 },
            end: { line: 0, character: 23 }
          }
        },
        {
          type: "operator",
          value: "<=",
          range: {
            start: { line: 0, character: 24 },
            end: { line: 0, character: 26 }
          }
        },
        {
          type: "operator",
          value: ">=",
          range: {
            start: { line: 0, character: 27 },
            end: { line: 0, character: 29 }
          }
        },
        {
          type: "operator",
          value: "<",
          range: {
            start: { line: 0, character: 30 },
            end: { line: 0, character: 31 }
          }
        },
        {
          type: "operator",
          value: ">",
          range: {
            start: { line: 0, character: 32 },
            end: { line: 0, character: 33 }
          }
        },
        {
          type: "operator",
          value: "!=",
          range: {
            start: { line: 0, character: 34 },
            end: { line: 0, character: 36 }
          }
        },
        {
          type: "operator",
          value: "==",
          range: {
            start: { line: 0, character: 37 },
            end: { line: 0, character: 39 }
          }
        },
        {
          type: "operator",
          value: "!",
          range: {
            start: { line: 0, character: 40 },
            end: { line: 0, character: 41 }
          }
        },
        {
          type: "operator",
          value: "~",
          range: {
            start: { line: 0, character: 42 },
            end: { line: 0, character: 43 }
          }
        },
        {
          type: "operator",
          value: "%=",
          range: {
            start: { line: 0, character: 44 },
            end: { line: 0, character: 46 }
          }
        },
        {
          type: "operator",
          value: "/=",
          range: {
            start: { line: 0, character: 47 },
            end: { line: 0, character: 49 }
          }
        },
        {
          type: "operator",
          value: "*=",
          range: {
            start: { line: 0, character: 50 },
            end: { line: 0, character: 52 }
          }
        },
        {
          type: "operator",
          value: "+=",
          range: {
            start: { line: 0, character: 53 },
            end: { line: 0, character: 55 }
          }
        },
        {
          type: "operator",
          value: "-=",
          range: {
            start: { line: 0, character: 56 },
            end: { line: 0, character: 58 }
          }
        },
        {
          type: "operator",
          value: "+",
          range: {
            start: { line: 0, character: 59 },
            end: { line: 0, character: 60 }
          }
        },
        {
          type: "operator",
          value: "-",
          range: {
            start: { line: 0, character: 61 },
            end: { line: 0, character: 62 }
          }
        },
        {
          type: "operator",
          value: "%",
          range: {
            start: { line: 0, character: 63 },
            end: { line: 0, character: 64 }
          }
        },
        {
          type: "operator",
          value: "/",
          range: {
            start: { line: 0, character: 65 },
            end: { line: 0, character: 66 }
          }
        },
        {
          type: "operator",
          value: "*",
          range: {
            start: { line: 0, character: 67 },
            end: { line: 0, character: 68 }
          }
        },
        {
          type: "operator",
          value: "=",
          range: {
            start: { line: 0, character: 69 },
            end: { line: 0, character: 70 }
          }
        },
        {
          type: "operator",
          value: "(",
          range: {
            start: { line: 0, character: 71 },
            end: { line: 0, character: 72 }
          }
        },
        {
          type: "operator",
          value: ")",
          range: {
            start: { line: 0, character: 73 },
            end: { line: 0, character: 74 }
          }
        },
        {
          type: "operator",
          value: "{",
          range: {
            start: { line: 0, character: 75 },
            end: { line: 0, character: 76 }
          }
        },
        {
          type: "operator",
          value: "}",
          range: {
            start: { line: 0, character: 77 },
            end: { line: 0, character: 78 }
          }
        },
        {
          type: "operator",
          value: "[",
          range: {
            start: { line: 0, character: 79 },
            end: { line: 0, character: 80 }
          }
        },
        {
          type: "operator",
          value: "]",
          range: {
            start: { line: 0, character: 81 },
            end: { line: 0, character: 82 }
          }
        },
        {
          type: "operator",
          value: ",",
          range: {
            start: { line: 0, character: 83 },
            end: { line: 0, character: 84 }
          }
        },
        {
          type: "operator",
          value: ":",
          range: {
            start: { line: 0, character: 85 },
            end: { line: 0, character: 86 }
          }
        },
        {
          type: "operator",
          value: "?",
          range: {
            start: { line: 0, character: 87 },
            end: { line: 0, character: 88 }
          }
        },
        {
          type: "operator",
          value: ";",
          range: {
            start: { line: 0, character: 89 },
            end: { line: 0, character: 90 }
          }
        },
        {
          type: "operator",
          value: ".",
          range: {
            start: { line: 0, character: 91 },
            end: { line: 0, character: 92 }
          }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });
  });

  describe("Whitespace", function () {
    it("Should ignore whitespace", function () {
      const program = ` \t\r\nfoo`;

      const expected = {
        type: "name",
        value: `foo`,
        range: {
          start: { line: 1, character: 0 },
          end: { line: 1, character: 3 }
        }
      };

      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });
  });

  describe("Comments", function () {
    it("Should ignore line comments", function () {
      const program = `// This is a line comment\nfoo`;

      const expected = {
        type: "name",
        value: `foo`,
        range: {
          start: { line: 1, character: 0 },
          end: { line: 1, character: 3 }
        }
      };

      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });

    it("Should ignore block comments", function () {
      const program = `/**\n * This is a block comment.\n */\n/* This is a block comment. */\n/*************/\nfoo`;

      const expected = {
        type: "name",
        value: `foo`,
        range: {
          start: { line: 5, character: 0 },
          end: { line: 5, character: 3 }
        }
      };

      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });
  });
});
