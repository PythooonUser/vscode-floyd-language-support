let assert = require("assert");
let Lexer = require("../floyd-lexer").Lexer;

describe("Lexer", function() {
  let lexer;

  this.beforeEach(function() {
    lexer = Lexer();
  });

  this.afterEach(function() {
    lexer = null;
  });

  assert.tokenPositionsEqual = function(expected, actual) {
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

  assert.tokenRangesEqual = function(expected, actual) {
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

  assert.tokensEqual = function(expected, actual) {
    assert.equal(expected.type, actual.type, "Token types should be equal.");
    assert.equal(expected.value, actual.value, "Token values should be equal.");
    assert.tokenRangesEqual(
      expected.range,
      actual.range,
      "Token ranges should be equal."
    );
  };

  assert.tokenArraysEqual = function(expected, actual) {
    assert.equal(
      expected.length,
      actual.length,
      "Number of tokens should be equal."
    );

    for (let i = 0; i < expected.length; i++) {
      assert.tokensEqual(expected[i], actual[i]);
    }
  };

  let getToken = function(program) {
    lexer.setInput(program);

    return lexer.lex();
  };

  let getTokens = function(program) {
    lexer.setInput(program);

    let tokens = [];
    let token = lexer.lex();

    while (token) {
      tokens.push(token);
      token = lexer.lex();
    }

    return tokens;
  };

  describe("Whitespace", function() {
    it("Should handle blanks", function() {
      const program = `  `;

      const expected = {
        type: "whitespace",
        value: `  `,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 2 }
        }
      };

      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });

    it("Should handle tabs", function() {
      const program = ` \t `;

      const expected = {
        type: "whitespace",
        value: ` \t `,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 3 }
        }
      };

      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });

    it("Should handle newline", function() {
      const program = ` \n `;

      const expected = {
        type: "whitespace",
        value: ` \n `,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 1, character: 1 }
        }
      };

      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });
  });

  describe("Directives", function() {
    it("Should handle #include directive", function() {
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

    it("Should handle #define directive", function() {
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

    it("Should handle #ifdef directive", function() {
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

    it("Should handle #ifndef directive", function() {
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

    it("Should handle #endif directive", function() {
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

  describe("Names", function() {
    it("Should handle names", function() {
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 8 },
            end: { line: 0, character: 9 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 18 },
            end: { line: 0, character: 19 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 28 },
            end: { line: 0, character: 29 }
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

  describe("Literals", function() {
    describe("Integers", function() {
      it("Should handle integers", function() {
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
            type: "whitespace",
            value: " ",
            range: {
              start: { line: 0, character: 1 },
              end: { line: 0, character: 2 }
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
            type: "whitespace",
            value: " ",
            range: {
              start: { line: 0, character: 3 },
              end: { line: 0, character: 4 }
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

    describe("Strings", function() {
      it("Should handle single-line strings", function() {
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

      it("Should handle multiline strings", function() {
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

  describe("Operators", function() {
    it("Should handle operators", function() {
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 2 },
            end: { line: 0, character: 3 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 5 },
            end: { line: 0, character: 6 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 8 },
            end: { line: 0, character: 9 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 11 },
            end: { line: 0, character: 12 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 14 },
            end: { line: 0, character: 15 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 16 },
            end: { line: 0, character: 17 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 19 },
            end: { line: 0, character: 20 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 21 },
            end: { line: 0, character: 22 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 23 },
            end: { line: 0, character: 24 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 26 },
            end: { line: 0, character: 27 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 29 },
            end: { line: 0, character: 30 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 31 },
            end: { line: 0, character: 32 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 33 },
            end: { line: 0, character: 34 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 36 },
            end: { line: 0, character: 37 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 39 },
            end: { line: 0, character: 40 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 41 },
            end: { line: 0, character: 42 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 43 },
            end: { line: 0, character: 44 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 46 },
            end: { line: 0, character: 47 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 49 },
            end: { line: 0, character: 50 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 52 },
            end: { line: 0, character: 53 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 55 },
            end: { line: 0, character: 56 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 58 },
            end: { line: 0, character: 59 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 60 },
            end: { line: 0, character: 61 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 62 },
            end: { line: 0, character: 63 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 64 },
            end: { line: 0, character: 65 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 66 },
            end: { line: 0, character: 67 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 68 },
            end: { line: 0, character: 69 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 70 },
            end: { line: 0, character: 71 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 72 },
            end: { line: 0, character: 73 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 74 },
            end: { line: 0, character: 75 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 76 },
            end: { line: 0, character: 77 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 78 },
            end: { line: 0, character: 79 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 80 },
            end: { line: 0, character: 81 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 82 },
            end: { line: 0, character: 83 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 84 },
            end: { line: 0, character: 85 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 86 },
            end: { line: 0, character: 87 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 88 },
            end: { line: 0, character: 89 }
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
          type: "whitespace",
          value: " ",
          range: {
            start: { line: 0, character: 90 },
            end: { line: 0, character: 91 }
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

  describe("Comments", function() {
    it("Should handle line comments", function() {
      const program = `// This is a line comment`;

      const expected = {
        type: "comment",
        value: "// This is a line comment",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 25 }
        }
      };
      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });

    it("Should handle block comments", function() {
      const program = `/**\n * This is a block comment.\n */\n/* This is a block comment. */\n/*************/`;

      const expected = [
        {
          type: "comment",
          value: `/**\n * This is a block comment.\n */`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 2, character: 3 }
          }
        },
        {
          type: "whitespace",
          value: "\n",
          range: {
            start: { line: 2, character: 3 },
            end: { line: 3, character: 0 }
          }
        },
        {
          type: "comment",
          value: `/* This is a block comment. */`,
          range: {
            start: { line: 3, character: 0 },
            end: { line: 3, character: 30 }
          }
        },
        {
          type: "whitespace",
          value: "\n",
          range: {
            start: { line: 3, character: 30 },
            end: { line: 4, character: 0 }
          }
        },
        {
          type: "comment",
          value: `/*************/`,
          range: {
            start: { line: 4, character: 0 },
            end: { line: 4, character: 15 }
          }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });
  });
});
