import * as path from "path";
import * as fs from "fs";
import { TextDocument, Diagnostic } from "vscode-languageserver";
import { parse } from "./floyd-parser";

interface CacheItem {
  uri: string;
  version: number;
  valid: boolean;
  errors: any;
  imports: any;
}

export class FloydDocumentManager {
  private documents: { [uri: string]: CacheItem };

  constructor() {
    this.documents = {};
  }

  updateDocument(document: TextDocument) {
    console.log(
      `Updating document: ${document.uri} (version ${document.version})`
    );

    // Get the document from cache
    let cacheItem = this.documents[document.uri];

    // If not present in cache add it to cache
    if (!cacheItem) {
      cacheItem = this.documents[document.uri] = {
        uri: document.uri,
        version: 0,
        valid: false,
        errors: null,
        imports: null
      };
    }

    // Abort if document has no updates
    if (document.version <= cacheItem.version) {
      return;
    }

    // Parse document and add info to cache item
    const parseInfo = parse(document.getText());
    cacheItem.version = document.version;
    cacheItem.valid = true;
    cacheItem.errors = parseInfo.errors;
    cacheItem.imports = parseInfo.imports;

    // Parse imports
    const root = path.dirname(path.normalize(this.fromVSCodeUri(document.uri)));
    for (const uri of cacheItem.imports) {
      const importUri = path.join(root, uri);
      const textDocument: TextDocument = this.createTextDocument(importUri);
      this.updateDocument(textDocument);
    }

    // TODO: Perform static code analysis using available imports
  }

  getDiagnostics(uri: string): { uri: string; diagnostics: Diagnostic[] } {
    let diagnostics: Diagnostic[] = [];

    this.documents[uri].errors.forEach(
      (error: { severity: any; range: any; message: string }) => {
        let diagnostic: Diagnostic = {
          severity: error.severity,
          range: error.range,
          message: error.message,
          source: "floyd"
        };

        diagnostics.push(diagnostic);
      }
    );

    return { uri, diagnostics };
  }

  createTextDocument(uri: string): TextDocument {
    uri = path.normalize(uri);
    let content: string = fs.readFileSync(uri, "utf-8");
    return TextDocument.create(this.toVSCodeUri(uri), "floyd", 1, content);
  }

  fromVSCodeUri(uri: string): string {
    uri = uri.replace(/file:[\\/]+/, "");
    uri = uri.replace("%3A", ":");
    return path.normalize(uri);
  }

  toVSCodeUri(uri: string): string {
    uri = uri.replace(/\\/g, path.posix.sep);
    uri = uri.replace(":", "%3A");
    uri = "file:" + path.posix.sep + path.posix.sep + path.posix.sep + uri;
    return uri;
  }
}
