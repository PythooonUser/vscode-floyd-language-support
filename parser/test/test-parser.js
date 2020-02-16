const assert = require("assert");
const _parse = require("../floyd-parser").parse;

let parse = function(program) {
  return _parse({ program });
};

describe("Parser", function() {
  assert.noErrors = function({ errors }) {
    assert.equal(errors.length, 0, "Parse errors occurred.");
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
      it("Should be able to declare a function");

      it("Should be able to declare a function with a parameter");

      it("Should be able to declare a function with multiple parameters");
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
