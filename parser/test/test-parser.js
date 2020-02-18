const assert = require("assert");
const _parse = require("../floyd-parser").parse;

let parse = function(program) {
  return _parse({ program });
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

  assert.errorsEqual = function(actual, expected) {
    assert.equal(
      actual.message,
      expected.message,
      "Error messages should be equal."
    );
    assert.positionsEqual(
      actual.position,
      expected.position,
      "Error positions should be equal."
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
            message: "Already defined",
            position: { line: 0, character: 4 }
          };

          const actual = parse(program);

          assert.errorsEqual(actual.errors[0], expectedError);
        });

        it("Should be able to init multiple integers", function() {
          const program = `int x = 0, y, z = 1;`;
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
            message: "Already defined",
            position: { line: 0, character: 7 }
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
          message: "Already defined",
          position: { line: 0, character: 5 }
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
      it("Should be able to define a verb");
    });
  });
});
