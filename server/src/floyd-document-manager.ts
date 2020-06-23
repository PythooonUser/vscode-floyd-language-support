import * as path from "path";
import { TextDocument, Diagnostic } from "vscode-languageserver";
import { parse } from "./floyd-parser";

interface CacheItem {
  uri: string;
  version: number;
  valid: boolean;
  errors: any;
}

export class FloydDocumentManager {
  private documents: { [uri: string]: CacheItem };

  constructor() {
    this.documents = {};
  }

  updateDocument(document: TextDocument): void {
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
        errors: null
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
}
