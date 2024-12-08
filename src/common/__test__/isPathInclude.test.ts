import { isPathIncluded } from "../isPathIncluded";

interface Patch {
  path: string[];
}

describe("isPathIncluded", () => {
  test("默认不填", () => {
    const patch: Patch = { path: ["a", "b", "c"] };

    expect(isPathIncluded(patch)).toBeTruthy();
  });

  test("should return true when path is included directly", () => {
    const patch: Patch = { path: ["a", "b", "c"] };
    const includePaths = [["a", "b", "c"]];

    expect(isPathIncluded(patch, [], includePaths)).toBeTruthy();
  });

  test("should return true when path is included as a parent", () => {
    const patch: Patch = { path: ["a", "b", "c"] };
    const includePaths = [["a", "b"]];

    expect(isPathIncluded(patch, [], includePaths)).toBeTruthy();
  });

  test("should return false when path is excluded directly", () => {
    const patch: Patch = { path: ["a", "b", "c"] };
    const excludePaths = [["a", "b", "c"]];

    expect(isPathIncluded(patch, excludePaths)).toBeFalsy();
  });

  test("should return false when path is excluded as a parent", () => {
    const patch: Patch = { path: ["a", "b", "c"] };
    const excludePaths = [["a", "b"]];

    expect(isPathIncluded(patch, excludePaths)).toBeFalsy();
  });

  test("should return true when no includePaths and path not excluded", () => {
    const patch: Patch = { path: ["a", "b", "c"] };
    const excludePaths = [["a", "b"]]; // This path is not matching

    expect(isPathIncluded(patch, excludePaths)).toBeFalsy();
  });

  test("should return false when path is excluded and no includePaths", () => {
    const patch: Patch = { path: ["a", "b", "c"] };
    const excludePaths = [["a", "b", "c"]];

    expect(isPathIncluded(patch, excludePaths)).toBeFalsy();
  });

  test("should return true when path is included and excludePaths present but not matching", () => {
    const patch: Patch = { path: ["a", "b", "c"] };
    const excludePaths = [["d", "e", "f"]];
    const includePaths = [["a", "b", "c"]];

    expect(isPathIncluded(patch, excludePaths, includePaths)).toBeTruthy();
  });
});
