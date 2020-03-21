const assert = require("assert");
const _parse = require("../src/floyd-parser").parse;

let parse = function(program) {
  return _parse(program);
};

describe("Parser", function() {
  assert.noErrors = function({ errors }) {
    assert.equal(errors.length, 0, "Parse errors occurred.");
  };

  assert.positionsEqual = function(actual, expected) {
    assert.equal(actual.line, expected.line, "Line numbers should be equal.");
    assert.equal(
      actual.character,
      expected.character,
      "Character numbers should be equal."
    );
  };

  assert.rangesEqual = function(actual, expected) {
    assert.positionsEqual(
      actual.start,
      expected.start,
      "Start ranges should be equal."
    );
    assert.positionsEqual(
      actual.end,
      expected.end,
      "End ranges should be equal."
    );
  };

  assert.errorsEqual = function(actual, expected) {
    assert.equal(
      actual.message,
      expected.message,
      "Error messages should be equal."
    );
    assert.rangesEqual(
      actual.range,
      expected.range,
      "Error ranges should be equal."
    );
  };

  describe("Definitions", function() {
    describe("Types", function() {
      describe("Integers", function() {
        it("Should be able to define an integer", function() {
          const program = `int x;`;
          const actual = parse(program);
          assert.noErrors(actual);
        });

        it("Should be able to init an integer", function() {
          const program = `int x = 0;`;
          const actual = parse(program);
          assert.noErrors(actual);
        });

        it("Should be able to define multiple integers", function() {
          const program = `int x, y, z;`;
          const actual = parse(program);
          assert.noErrors(actual);
        });

        it("Should not define integer variables with same name", function() {
          const program = `int x, x, y;`;

          const expectedError = {
            message: "[floyd] Already defined",
            range: {
              start: { line: 0, character: 4 },
              end: { line: 0, character: 5 }
            }
          };

          const actual = parse(program);

          assert.errorsEqual(actual.errors[0], expectedError);
        });

        it("Should be able to init multiple integers", function() {
          const program = `int x = 0, y, z = 1;`;
          const actual = parse(program);
          assert.noErrors(actual);
        });

        it("Should be able to inline integer assignments", function() {
          const program = `int x = 0; x += 1; x -= 1; x /= 1; x *= 1; x++; x--;`;
          const actual = parse(program);
          assert.noErrors(actual);
        });
      });

      describe("Strings", function() {
        it("Should be able to define a string", function() {
          const program = `string s;`;
          const actual = parse(program);
          assert.noErrors(actual);
        });

        it("Should be able to init a string", function() {
          const program = `string s = "Hello World";`;
          const actual = parse(program);
          assert.noErrors(actual);
        });

        it("Should be able to define multiple strings", function() {
          const program = `string a, b, c;`;
          const actual = parse(program);
          assert.noErrors(actual);
        });

        it("Should not define string variables with same name", function() {
          const program = `string a, a, b;`;

          const expectedError = {
            message: "[floyd] Already defined",
            range: {
              start: { line: 0, character: 7 },
              end: { line: 0, character: 8 }
            }
          };

          const actual = parse(program);

          assert.errorsEqual(actual.errors[0], expectedError);
        });

        it("Should be able to init multiple strings", function() {
          const program = `string a = "Foo", b, c = "Bar";`;
          const actual = parse(program);
          assert.noErrors(actual);
        });
      });

      describe("Objects", function() {
        it("Should be able to define an object", function() {
          const program = `object x;`;
          const actual = parse(program);
          assert.noErrors(actual);
        });

        it("Should be able to init an object");
      });
    });

    describe("Functions", function() {
      it("Should be able to declare a function", function() {
        const program = `void test() {}`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should not define variable with same name as function", function() {
        const program = `void test() {} int test;`;

        const expectedError = {
          message: "[floyd] Already defined",
          range: {
            start: { line: 0, character: 5 },
            end: { line: 0, character: 9 }
          }
        };

        const actual = parse(program);

        assert.errorsEqual(actual.errors[0], expectedError);
      });

      it("Should be able to declare a function with a parameter", function() {
        const program = `void test(int x) {}`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should be able to declare a function with multiple parameters", function() {
        const program = `void test(int x, string s, object o) {}`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should create new scope for parameters and body", function() {
        const program = `void test(int x) {} int x = 0;`;
        const actual = parse(program);
        assert.noErrors(actual);
      });
    });

    describe("Classes", function() {
      it("Should be able to declare a class", function() {
        const program = `class Test {}`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should be able to declare an abstract class", function() {
        const program = `class abstract Test {}`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should be able to declare a class with inheritance", function() {
        const program = `class Test:Parent {}`;
        const actual = parse(program);
        assert.noErrors(actual);
      });
    });

    describe("Verbs", function() {
      it("Should be able to define a verb", function() {
        const program = `verb("links", D_WEST, 0);`;
        const actual = parse(program);
        assert.noErrors(actual);
      });
    });
  });

  describe("Statements", function() {
    describe("Control Flow", function() {
      it("Should handle return", function() {
        const program = `void test() { return; }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle return with simple expression", function() {
        const program = `void test() { return 0; }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle return with complex expression", function() {
        const program = `void test() { return (0 || test.property); }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle while loop", function() {
        const program = `void test() {
          int i = 0;
          while(i < 5) {}
        }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle do-while loop", function() {
        const program = `void test() {
          int i = 0;
          do { i++; } while(i < 5);
        }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it.skip("Should handle for loop", function() {
        const program = `void test() {
          int i;
          for(i = 0; i < 10; i++) {}
        }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle if statement", function() {
        const program = `void test() {
          int i = 0;
          if (i < 10) {}
        }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle if-else statement", function() {
        const program = `void test() {
          int i = 0;
          if (i < 10) {}
          else {}
        }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle nested if-else statements", function() {
        const program = `void test() {
          int i = 0;
          if (i < 10) {
            if (i < 5) {}
            else {}
          }
          else {
            if (i > 20) {}
            else {}
          }
        }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it.skip("Should handle switch statement", function() {
        const program = `void test() {
          int i = 0;
          switch(i) {
            case(-1);
            case(0);
              i += 1;
              break;
            case(1);
              i += 2;
              break;
            default;
              i = 0;
          }
        }`;
        const actual = parse(program);
        assert.noErrors(actual);
      });
    });
  });

  describe("Expressions", function() {
    describe("Invokations", function() {
      it("Should handle function invocation", function() {
        const program = `void test() {} test();`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle function invocation with one parameter", function() {
        const program = `void test(int x) {} test(10);`;
        const actual = parse(program);
        assert.noErrors(actual);
      });

      it("Should handle function invocation with multiple parameters", function() {
        const program = `void test(int x, string s, int y) {} test(10, "Hello", 0);`;
        const actual = parse(program);
        assert.noErrors(actual);
      });
    });
  });
});
