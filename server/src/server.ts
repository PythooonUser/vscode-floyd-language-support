import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocument,
  Diagnostic,
  DiagnosticSeverity
} from "vscode-languageserver";

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
  let diagnostics: Diagnostic[] = [];

  let diagnostic: Diagnostic = {
    severity: DiagnosticSeverity.Warning,
    range: {
      start: textDocument.positionAt(0),
      end: textDocument.positionAt(0)
    },
    message: `Example diagnostic`,
    source: "floyd"
  };

  diagnostics.push(diagnostic);

  connection.sendDiagnostics({
    uri: textDocument.uri,
    diagnostics
  });
}

documents.listen(connection);
connection.listen();
