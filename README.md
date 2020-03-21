# vscode-floyd-language-support

[![Language](https://img.shields.io/badge/language-floyd-green.svg?style=flat-square)](http://oliver-berse.de/)
[![Twitter](https://img.shields.io/badge/twitter-pythooonuser-green.svg?style=flat-square)](https://twitter.com/pythooonuser/)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)

This is an extension for the code editor [**VS Code**](https://code.visualstudio.com/) that adds language support for the programming language [**Floyd**](http://oliver-berse.de/). **Floyd** is used to write classical text adventures (in German only).

You can find out more about the current development of the project by visiting the [extension repository on GitHub](https://github.com/pythooonuser/vscode-floyd-language-support/).

## Features

The **Floyd** language extension currently adds the following features:

- Comment Toggling
- Bracket Autoclosing
- Bracket Autosurrounding
- Code Section Folding
- Indentation Rules
- Syntax Highlighting
- Code Snippets

For the future many more features are planned, like more complex syntax highlighting, code intellisense, code completion, signature help for built-in functions etc.

_Please note that development goes slowly since this is a free-time project only._

### Syntax Highlighting

Basic syntax highlighting is applied to `.floyd` source code files. It introduces colors for comments, literals, all available keywords, class and function declarations etc.

The following example is taken from the game _Download_ (Oliver Berse, 2004) using the Dark+ color theme:

![Syntax Highlighting Example](https://raw.githubusercontent.com/PythooonUser/vscode-floyd-language-support/master/.media/syntax_highlighting.png)

### Snippets

The extension also adds several snippets in order to enhance the coding experience for power users by providing pre-defined code sections for common-used operations.

- Include Directive
- Include Standard Library
- Define Directive
- Ifdef Directive
- Ifndef Directive
- Class Declaration
- Abstract Class Declaration
- Room Declaration
- Abstract Room Declaration
- Exit Declaration
- Abstract Exit Declaration
- Item Declaration
- Abstract Item Declaration
- Creature Declaration
- Abstract Create Declaration
- Verb Statement
- If Statement
- If-Else Statement
- Switch Statement
- Fetch Statement
- For Loop
- While Loop
- Do-While Loop

## Known Issues

No known issues.

_If you find a bug, have a question or feature request, [please feel free to create an issue](https://github.com/PythooonUser/vscode-floyd-language-support/issues/new) or [reach out to me on Twitter](https://twitter.com/PythooonUser). I try to answer your issue as fast as possible. Please note, however, that my support for this extension is limited, because I build it in my free time and therefore development goes slowly._

## Release Notes

For further details please refer to the [CHANGELOG](https://github.com/PythooonUser/vscode-floyd-language-support/blob/master/CHANGELOG.md).

## License

MIT. See the [license document](https://github.com/PythooonUser/vscode-floyd-language-support/blob/master/LICENSE) for the full text.
