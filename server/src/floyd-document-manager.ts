import * as path from "path";
import * as fs from "fs";
import {
  TextDocument,
  Diagnostic,
  PublishDiagnosticsParams,
  DidChangeTextDocumentNotification
} from "vscode-languageserver";
import { parse, analyseUndefinedSymbols } from "./floyd-parser";

interface CacheItem {
  uri: string;
  version: number;
  symbols: any;
  scope: any;
  errors: any;
  imports: any;
}

interface ProgramInfo {
  ast: any;
  scope: any;
  symbols: any;
  errors: any;
  imports: any;
}

interface ProgramError {
  severity: 1 | 2 | 3 | 4 | undefined;
  range: any;
  message: string;
}

export class FloydDocumentManager {
  private documents: { [uri: string]: CacheItem };

  constructor() {
    this.documents = {};
  }

  updateDocument(document: TextDocument) {
    const uri: string = this.fromVSCodeUri(document.uri);
    console.log(`Updating document ${uri} (version ${document.version})`);

    let cacheItem: CacheItem = this.documents[uri];

    if (!cacheItem || cacheItem.version < document.version) {
      const programInfo: ProgramInfo = parse(document.getText());

      cacheItem = {
        uri,
        version: document.version,
        symbols: programInfo.symbols,
        scope: programInfo.scope,
        errors: programInfo.errors,
        imports: programInfo.imports
      };

      this.documents[uri] = cacheItem;

      this.updateImports(cacheItem, uri);
      this.analyseUndefinedSymbols(cacheItem);
    }
  }

  updateImports(cacheItem: CacheItem, root: string) {
    root = path.dirname(root);
    const imports = cacheItem.imports;

    for (let i of imports) {
      let uri = i.first.path;
      uri = path.normalize(path.join(root, uri));

      if (!(uri in this.documents)) {
        if (fs.existsSync(uri)) {
          let content: string = fs.readFileSync(uri, "utf-8");
          let document = TextDocument.create(
            this.toVSCodeUri(uri),
            "floyd",
            1,
            content
          );
          this.updateDocument(document);
        } else {
          cacheItem.errors.push({
            message: `Imported file does not exist`,
            range: i.first.range,
            severity: 1
          });
        }
      }
    }
  }

  analyseUndefinedSymbols(cacheItem: CacheItem): void {
    const symbols = cacheItem.symbols;

    let imports: CacheItem[] = [];
    for (let i of cacheItem.imports) {
      let uri = i.first.path;
      uri = path.normalize(path.join(path.dirname(cacheItem.uri), uri));

      if (fs.existsSync(uri)) {
        imports.push(this.documents[uri]);
      }
    }

    let errors = analyseUndefinedSymbols(symbols, imports);
    cacheItem.errors = cacheItem.errors.concat(errors);
  }

  getDiagnosticsAll(): PublishDiagnosticsParams[] {
    let diagnosticsAll: PublishDiagnosticsParams[] = [];

    for (let uri in this.documents) {
      let cacheItem: CacheItem = this.documents[uri];
      let diagnostics: Diagnostic[] = [];

      cacheItem.errors.forEach((error: ProgramError) => {
        diagnostics.push({
          severity: error.severity,
          range: error.range,
          message: error.message,
          source: "floyd"
        });
      });

      diagnosticsAll.push({
        uri: this.toVSCodeUri(uri),
        diagnostics
      });
    }

    return diagnosticsAll;
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
