// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/utils/ts-morph.ts

import {
  type ArrayLiteralExpression,
  IndentationText,
  type ObjectLiteralExpression,
  Project,
  QuoteKind,
  SyntaxKind,
} from "ts-morph";

export const tsProject = new Project({
  useInMemoryFileSystem: false,
  skipAddingFilesFromTsConfig: true,
  manipulationSettings: {
    quoteKind: QuoteKind.Single,
    indentationText: IndentationText.TwoSpaces,
  },
});

export function ensureArrayProperty(
  obj: ObjectLiteralExpression,
  name: string,
) {
  return (obj
    .getProperty(name)
    ?.getFirstDescendantByKind(SyntaxKind.ArrayLiteralExpression) ??
    obj
      .addPropertyAssignment({ name, initializer: "[]" })
      .getFirstDescendantByKindOrThrow(
        SyntaxKind.ArrayLiteralExpression,
      )) as ArrayLiteralExpression;
}
