import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocument
} from "vscode-languageserver";

import { FloydDocumentManager } from "./floyd-document-manager";

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

let documentManager = new FloydDocumentManager();

connection.onInitialize((params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: documents.syncKind
    }
  };
});

documents.onDidChangeContent(change => {
  const textDocument: TextDocument = change.document;
  documentManager.updateDocument(textDocument);

  const diagnostics = documentManager.getDiagnostics(textDocument.uri);
  connection.sendDiagnostics(diagnostics);
});

documents.listen(connection);
connection.listen();
