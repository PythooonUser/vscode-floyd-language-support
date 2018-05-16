# vscode-floyd-language-support

[![Language](https://img.shields.io/badge/language-floyd-green.svg?style=flat-square)](http://oliver-berse.de/)
[![Twitter](https://img.shields.io/badge/twitter-pythooonuser-green.svg?style=flat-square)](https://twitter.com/pythooonuser/)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)

This is an extension for the code editor [**VS Code**](https://code.visualstudio.com/) that adds language support for the programming language [**Floyd**](http://oliver-berse.de/). **Floyd** is used to write classical Text Adventures (in German).

You can find out more about the current development of the project by visiting the [extension repository on GitHub](https://github.com/pythooonuser/vscode-floyd-language-support/).

## Features
The **Floyd** language extension currently adds the following features:
- basic syntax highlighting
- snippets

For the future many more features are planned, like more complex syntax highlighting, code intellisense, code completion, signature help for built-in functions using a language server etc.

*Please note that development goes slowly since this is a free-time project only.*

### Syntax Highlighting
Basic syntax highlighting is applied to `.floyd` **Floyd** source code files. It introduces colors for comments, literals, all available keywords, class and function declarations etc.

The following is an example taken from the game **Nebelmond** (Oliver Berse, 2002-2003) using the Dark+ color theme:

![Syntax Highlighting Example](https://raw.githubusercontent.com/PythooonUser/vscode-floyd-language-support/master/.media/SyntaxHighlightingExample.png)

### Snippets
Currently there are three available snippets to enhance the coding experience to provide predefined sections of code for common used operations.

#### Insert `onAction` Statement
![Snippet onAction](https://raw.githubusercontent.com/PythooonUser/vscode-floyd-language-support/master/.media/snippet_onAction.gif)

#### Insert `main` Function
![Snippet main](https://raw.githubusercontent.com/PythooonUser/vscode-floyd-language-support/master/.media/snippet_main.gif)

#### Insert `class` Declaration
![Snippet class](https://raw.githubusercontent.com/PythooonUser/vscode-floyd-language-support/master/.media/snippet_class.gif)

## Known Issues
No known issues.

*If you find a bug, have a question or have a feature request, [please feel free to create an issue](https://github.com/PythooonUser/vscode-floyd-language-support/issues/new) or [reach out to me on Twitter](https://twitter.com/PythooonUser). I try to answer your issue as fast as possible. Please note, however, that my support for this extension is limited, because I build it in my free time and therefore development goes slowly.*

## Release Notes
For further details please refer to the [CHANGELOG](https://github.com/PythooonUser/vscode-floyd-language-support/blob/master/CHANGELOG.md).

## License
MIT. See the [license document](https://github.com/PythooonUser/vscode-floyd-language-support/blob/master/LICENSE) for the full text.
