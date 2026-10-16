/// Tree-sitter grammar for epScript (.eps) — StarCraft EUD map scripting.
/// Minimal grammar for syntax highlighting: keywords, comments, strings,
/// numbers, EUD tokens, and basic structure.
module.exports = grammar({
  name: 'epscript',

  extras: $ => [/\s/, $.comment],

  conflicts: $ => [
    [$.if_statement],
  ],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.import_statement,
      $.variable_declaration,
      $.function_definition,
      $.object_definition,
      $.if_statement,
      $.for_statement,
      $.foreach_statement,
      $.while_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.switch_statement,
      $.expression_statement,
      $.block,
    ),

    import_statement: $ => seq(
      'import', $.dotted_name,
      optional(seq('as', $.identifier)),
      ';'
    ),

    dotted_name: $ => seq(
      $.identifier,
      repeat(seq('.', $.identifier))
    ),

    variable_declaration: $ => seq(
      choice('var', 'const', 'static'),
      $.identifier,
      optional(seq(':', $._expression)),
      optional(seq('=', $._expression)),
      ';'
    ),

    function_definition: $ => seq(
      'function', $.identifier,
      '(', optional($.parameter_list), ')',
      $.block
    ),

    parameter_list: $ => seq(
      $.parameter,
      repeat(seq(',', $.parameter))
    ),

    parameter: $ => seq(
      $.identifier,
      optional(seq(':', $._expression))
    ),

    object_definition: $ => seq(
      'object',
      $.identifier,
      optional(seq('extends', $.identifier)),
      $.block
    ),

    if_statement: $ => seq(
      'if', '(', $._expression, ')',
      $._statement,
      optional(seq('else', $._statement))
    ),

    for_statement: $ => seq(
      'for', '(', $._expression, ';', $._expression, ';', $._expression, ')',
      $._statement
    ),

    foreach_statement: $ => seq(
      'foreach',
      '(',
      $.identifier,
      repeat(seq(',', $.identifier)),
      ':',
      $._expression,
      ')',
      $._statement
    ),

    while_statement: $ => seq(
      'while', '(', $._expression, ')',
      $._statement
    ),

    return_statement: $ => seq('return', optional($._expression), ';'),
    break_statement: $ => seq('break', ';'),
    continue_statement: $ => seq('continue', ';'),

    switch_statement: $ => seq(
      choice('switchcase', 'epdswitch'),
      '(', $._expression, ')',
      '{',
      repeat(choice(
        seq('case', $._expression, ':', repeat($._statement)),
        seq('default', ':', repeat($._statement))
      )),
      '}'
    ),

    expression_statement: $ => seq(
      choice(
        $._expression,
        seq('once', $.block),
        seq('l2v', '(', $._expression, ')')
      ),
      ';'
    ),

    block: $ => seq('{', repeat($._statement), '}'),

    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.member_expression,
      $.assignment_expression,
      $.identifier,
      $.number,
      $.string,
      $.eud_token,
      $.list_literal,
      $.parenthesized_expression,
    ),

    binary_expression: $ => prec.left(1, seq(
      $._expression,
      choice(
        '+', '-', '*', '/', '%', '**',
        '==', '!=', '<', '<=', '>', '>=',
        '&&', '||', '&', '|', '^', '<<', '>>',
      ),
      $._expression
    )),

    unary_expression: $ => prec(2, seq(
      choice('-', '!', '~', '++', '--'),
      $._expression
    )),

    call_expression: $ => seq(
      $._expression,
      '(',
      optional(seq($._expression, repeat(seq(',', $._expression)), optional(','))),
      ')'
    ),

    member_expression: $ => seq($._expression, '.', $.identifier),

    assignment_expression: $ => prec.right(1, seq(
      $._expression,
      choice('=', '+=', '-=', '*=', '/=', '%='),
      $._expression
    )),

    list_literal: $ => seq(
      '[',
      optional(seq($._expression, repeat(seq(',', $._expression)), optional(','))),
      ']'
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number: $ => choice(
      /0[xX][0-9a-fA-F]+/,
      /0[oO][0-7]+/,
      /0[bB][01]+/,
      /[0-9]+(\.[0-9]+)?/
    ),

    string: $ => choice(
      seq('b', '"', /[^"]*/, '"'),
      seq('"', /[^"]*/, '"'),
      seq("'", /[^']*/, "'")
    ),

    eud_token: $ => /\$[ULSTB]/,

    comment: $ => token(choice(
      seq('//', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
    )),
  }
});
