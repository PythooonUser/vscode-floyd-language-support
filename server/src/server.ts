import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocument,
  Diagnostic
} from "vscode-languageserver";

import { parse } from "./floyd-parser";

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

connection.onInitialize((params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: documents.syncKind
    }
  };
});

documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const { errors } = parse(textDocument.getText());

  let diagnostics: Diagnostic[] = [];

  errors.forEach((error: { severity: any; range: any; message: any }) => {
    let diagnostic: Diagnostic = {
      severity: error.severity,
      range: error.range,
      message: error.message,
      source: "floyd",
      code: 100
    };

    diagnostics.push(diagnostic);
  });

  connection.sendDiagnostics({
    uri: textDocument.uri,
    diagnostics
  });
}

documents.listen(connection);
connection.listen();
