# Floyd Language Description

## Preprocessor Directives

### Include Statement
```
#include <fileName.floyd>
```

### Define Statement
```
#define C_ONSTANT
```
```
#define C_ONSTANT 1234
```

### Conditional Statement
```
#ifndef C_ONSTANT
```
```
#endif
```

## Comments

### Line Comment
```
// Line Comment
```

### Block Comment
```
/* Block Comment
   BLock Comment */
```

## Primitive Variable Types

### Strings
```
string
"This is a String"
```
Strings can contain special characters:
- `^`: New line
- `\`: Gets replaced with `"`

Strings can contain HTML-like tags:
- `<b> ... </b>`: Bold
- `<i> ... </i>`: Italic
- `<u> ... </u>`: Underline
- `<s> ... </s>`: Crossed out
- `<r> ... </r>`: Background and foreground color switched

Strings can contain variables/word selections:
- `<this>`: Global variables
- `<der, die>`: Selection

Strings used in the method `verb`:
- `|`: OR in verb patterns
- `#verb`: Identifier in verb patterns

Strings used in the methods `setShort`, `setLong`:
- `+`
- `-`
- `&`
- `$`
- `*`
- `,`

Strings can contain HTML-like colors:
- `#00AA00`

### Numbers
```
int
1234
```

## Function Declaration
```
ReturnType FunctionName() {}
```
```
ReturnType FunctionName(Param1Type Param1Name, ... ) {}
```
The return type can be one of the following: `void, int, string, object`.

## Class Declaration
```
class ClassName:SuperClass {}
```

## Operators
- `++`
- `--`
- `!`
- `~`
- `*`
- `/`
- `%`
- 