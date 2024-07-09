statement
: (declaration | assignment | expression)
;

declaration
: propertyDeclaration
;

propertyDeclaration
: 'val'
variableDeclaration
('=' expression)? ';'?
;

assignment
: directlyAssignableExpression '=' expression
;

directlyAssignableExpression
: postfixUnaryExpression assignableSuffix
| simpleIdentifier
| parenthesizedDirectlyAssignableExpression
;

parenthesizedDirectlyAssignableExpression
: '(' directlyAssignableExpression ')'
;

postfixUnaryExpression
: primaryExpression postfixUnarySuffix\*
;

postfixUnarySuffix
: callSuffix
| navigationSuffix
;

callSuffix
: ((valueArguments? annotatedLambda) | valueArguments)
;

annotatedLambda
: '{' statements '}'
;

statements
: (statement (semis statement)\*)? semis?
;

valueArguments
: '(' (valueArgument (',' valueArgument)\* ','?)? ')'
;

valueArgument
: (simpleIdentifier '=')? expression
;

primaryExpression
: parenthesizedExpression
| simpleIdentifier
| literalConstant
| stringLiteral
| thisExpression
;

parenthesizedExpression
: '(' expression ')'

assignableSuffix
: navigationSuffix

navigationSuffix
: memberAccessOperator simpleIdentifier
;

memberAccessOperator
: '.'
;

variableDeclaration
: simpleIdentifier
;

expression
: infixFunctionCall
;

infixFunctionCall
: rangeExpression (simpleIdentifier rangeExpression)\*
;

rangeExpression
: postfixUnaryExpression

simpleIdentifier
: Identifier

Identifier
: (Letter | '_') (Letter | '_' | UnicodeDigit)\*
| '`' ~([\r\n] | '`')+ '`'
;

stringLiteral
: lineStringLiteral | multiLineStringLiteral
;

lineStringLiteral
: '"' (lineStringContent)\* '"'
;

lineStringContent
: LineStrText
| LineStrEscapedChar
;

LineStrText
: ~('\\' | '"')+
;

LineStrEscapedChar
: EscapedIdentifier
| UniCharacterLiteral
;

EscapedIdentifier
: '\\' ('t' | 'b' | 'r' | 'n' | '\'' | '"' | '\\' | '$')
;

UniCharacterLiteral
: '\\' 'u' HexDigit HexDigit HexDigit HexDigit
;

multiLineStringLiteral
: '"""' (multiLineStringContent | '"')\*
TRIPLE_QUOTE_CLOSE
;

multiLineStringContent
: MultiLineStrText
| '"'
;

MultiLineStrText
: ~('"')+
;

literalConstant
: BooleanLiteral
| IntegerLiteral
| HexLiteral
| BinLiteral
| 'null'
| LongLiteral
| UnsignedLiteral
;

thisExpression
: 'this'
;

Omitted (same as Kotlin)
semis
Letter
UnicodeDigit
BooleanLiteral
IntegerLiteral
LongLiteral
UnsignedLiteral
HexLiteral
BinLiteral
