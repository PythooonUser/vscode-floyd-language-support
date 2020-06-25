import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  PublishDiagnosticsParams
} from "vscode-languageserver";

import { FloydDocumentManager } from "./floyd-document-manager";

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

let documentManager = new FloydDocumentManager();

const sendDiagnostics = (): void => {
  const diagnosticsAll: PublishDiagnosticsParams[] = documentManager.getDiagnosticsAll();

  for (const diagnostics of diagnosticsAll) {
    connection.sendDiagnostics(diagnostics);
  }
};

connection.onInitialize((params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: documents.syncKind
    }
  };
});

documents.onDidChangeContent(change => {
  documentManager.updateDocument(change.document);
  sendDiagnostics();
});

documents.listen(connection);
connection.listen();
