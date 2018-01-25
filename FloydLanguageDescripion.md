# Floyd Language Description

## Preprocessor Directives

### Include Statement
```
#include <fileName.floyd>
```

### Define Statement
```
#define C_ONSTANT 1234
```

### Conditional Statement
```
#ifndef C_ONSTANT
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
Strings can contain escape characters and tags:
- `^`: New Line
- `<b> ... </b>`: Bold
- `<u> ... </u>`: Underlined
- `<this>`: Global variables
- `<der, die>`: Selection
- `|`: OR in verb patterns
- `#verb`: Identifier in verb patterns

### Numbers
```
int
1234
```

## Function Declaration
```
ReturnType FunctionName(OptParam1Type OptParam1Name, ... ) {}
```

## Class Declaration
```
class ClassName:SuperClass {}
```

## Operators
