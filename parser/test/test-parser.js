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
          // TODO: Check that int has been marked as reserved word
          // TODO: Check that x has been defined in scope
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
        it("Should be able to define a string");

        it("Should be able to init a string");
      });

      describe("Objects", function() {
        it("Should be able to define an object");

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
      it("Should be able to declare a class");

      it("Should be able to declare an abstract class");

      it("Should be able to declare a class with inheritance");
    });

    describe("Verbs", function() {
      it("Should be able to define a verb");
    });
  });
});
