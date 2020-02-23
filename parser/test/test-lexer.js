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

  assert.tokensEqual = function(expected, actual) {
    assert.equal(expected.type, actual.type, "Token types should be equal.");
    assert.equal(expected.value, actual.value, "Token values should be equal.");
    assert.equal(
      expected.position.line,
      actual.position.line,
      "Token line positions should be equal."
    );
    assert.equal(
      expected.position.character,
      actual.position.character,
      "Token character positions should be equal."
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
        position: { line: 0, character: 0 }
      };

      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });

    it("Should handle tabs", function() {
      const program = ` \t `;

      const expected = {
        type: "whitespace",
        value: ` \t `,
        position: { line: 0, character: 0 }
      };

      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });

    it("Should handle newline", function() {
      const program = ` \n `;

      const expected = {
        type: "whitespace",
        value: ` \n `,
        position: { line: 0, character: 0 }
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
          position: { line: 0, character: 0 }
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
          position: { line: 0, character: 0 }
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
          position: { line: 0, character: 0 }
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
          position: { line: 0, character: 0 }
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
          position: { line: 0, character: 0 }
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
          position: { line: 0, character: 0 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 8 }
        },
        {
          type: "name",
          value: "test_name",
          position: { line: 0, character: 9 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 18 }
        },
        {
          type: "name",
          value: "_testName",
          position: { line: 0, character: 19 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 28 }
        },
        {
          type: "name",
          value: "testName0",
          position: { line: 0, character: 29 }
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
            position: { line: 0, character: 0 }
          },
          {
            type: "whitespace",
            value: " ",
            position: { line: 0, character: 1 }
          },
          {
            type: "integer",
            value: "1",
            position: { line: 0, character: 2 }
          },
          {
            type: "whitespace",
            value: " ",
            position: { line: 0, character: 3 }
          },
          {
            type: "integer",
            value: "1234",
            position: { line: 0, character: 4 }
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
          position: { line: 0, character: 0 }
        };

        const actual = getToken(program);

        assert.tokensEqual(expected, actual);
      });

      it("Should handle multiline strings", function() {
        const program = `"Hello\nWorld!"`;

        const expected = {
          type: "string",
          value: `"Hello\nWorld!"`,
          position: { line: 0, character: 0 }
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
          position: { line: 0, character: 0 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 2 }
        },
        {
          type: "operator",
          value: ">>",
          position: { line: 0, character: 3 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 5 }
        },
        {
          type: "operator",
          value: "++",
          position: { line: 0, character: 6 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 8 }
        },
        {
          type: "operator",
          value: "--",
          position: { line: 0, character: 9 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 11 }
        },
        {
          type: "operator",
          value: "&&",
          position: { line: 0, character: 12 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 14 }
        },
        {
          type: "operator",
          value: "&",
          position: { line: 0, character: 15 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 16 }
        },
        {
          type: "operator",
          value: "||",
          position: { line: 0, character: 17 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 19 }
        },
        {
          type: "operator",
          value: "|",
          position: { line: 0, character: 20 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 21 }
        },
        {
          type: "operator",
          value: "^",
          position: { line: 0, character: 22 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 23 }
        },
        {
          type: "operator",
          value: "<=",
          position: { line: 0, character: 24 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 26 }
        },
        {
          type: "operator",
          value: ">=",
          position: { line: 0, character: 27 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 29 }
        },
        {
          type: "operator",
          value: "<",
          position: { line: 0, character: 30 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 31 }
        },
        {
          type: "operator",
          value: ">",
          position: { line: 0, character: 32 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 33 }
        },
        {
          type: "operator",
          value: "!=",
          position: { line: 0, character: 34 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 36 }
        },
        {
          type: "operator",
          value: "==",
          position: { line: 0, character: 37 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 39 }
        },
        {
          type: "operator",
          value: "!",
          position: { line: 0, character: 40 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 41 }
        },
        {
          type: "operator",
          value: "~",
          position: { line: 0, character: 42 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 43 }
        },
        {
          type: "operator",
          value: "%=",
          position: { line: 0, character: 44 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 46 }
        },
        {
          type: "operator",
          value: "/=",
          position: { line: 0, character: 47 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 49 }
        },
        {
          type: "operator",
          value: "*=",
          position: { line: 0, character: 50 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 52 }
        },
        {
          type: "operator",
          value: "+=",
          position: { line: 0, character: 53 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 55 }
        },
        {
          type: "operator",
          value: "-=",
          position: { line: 0, character: 56 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 58 }
        },
        {
          type: "operator",
          value: "+",
          position: { line: 0, character: 59 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 60 }
        },
        {
          type: "operator",
          value: "-",
          position: { line: 0, character: 61 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 62 }
        },
        {
          type: "operator",
          value: "%",
          position: { line: 0, character: 63 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 64 }
        },
        {
          type: "operator",
          value: "/",
          position: { line: 0, character: 65 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 66 }
        },
        {
          type: "operator",
          value: "*",
          position: { line: 0, character: 67 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 68 }
        },
        {
          type: "operator",
          value: "=",
          position: { line: 0, character: 69 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 70 }
        },
        {
          type: "operator",
          value: "(",
          position: { line: 0, character: 71 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 72 }
        },
        {
          type: "operator",
          value: ")",
          position: { line: 0, character: 73 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 74 }
        },
        {
          type: "operator",
          value: "{",
          position: { line: 0, character: 75 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 76 }
        },
        {
          type: "operator",
          value: "}",
          position: { line: 0, character: 77 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 78 }
        },
        {
          type: "operator",
          value: "[",
          position: { line: 0, character: 79 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 80 }
        },
        {
          type: "operator",
          value: "]",
          position: { line: 0, character: 81 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 82 }
        },
        {
          type: "operator",
          value: ",",
          position: { line: 0, character: 83 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 84 }
        },
        {
          type: "operator",
          value: ":",
          position: { line: 0, character: 85 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 86 }
        },
        {
          type: "operator",
          value: "?",
          position: { line: 0, character: 87 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 88 }
        },
        {
          type: "operator",
          value: ";",
          position: { line: 0, character: 89 }
        },
        {
          type: "whitespace",
          value: " ",
          position: { line: 0, character: 90 }
        },
        {
          type: "operator",
          value: ".",
          position: { line: 0, character: 91 }
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
        position: { line: 0, character: 0 }
      };
      const actual = getToken(program);

      assert.tokensEqual(expected, actual);
    });

    it("Should handle block comments", function() {
      const program = `/**\n * This is a block comment.\n */\n/* This is a block comment. */`;

      const expected = [
        {
          type: "comment",
          value: `/**\n * This is a block comment.\n */`,
          position: { line: 0, character: 0 }
        },
        {
          type: "whitespace",
          value: "\n",
          position: { line: 2, character: 3 }
        },
        {
          type: "comment",
          value: `/* This is a block comment. */`,
          position: { line: 3, character: 0 }
        }
      ];

      const actual = getTokens(program);

      assert.tokenArraysEqual(expected, actual);
    });
  });
});
