/**
 * Safe Math Expression Parser and Evaluator
 * Uses the Shunting-Yard algorithm to parse and evaluate mathematical expressions
 * without using standard Javascript eval() or Function().
 */

// Factorial helper
function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // Overflow limit for JS numbers
  if (!Number.isInteger(n)) {
    // Simple gamma approximation for non-integers if needed, otherwise return NaN
    // Most standard calculators only calculate integer factorials
    return NaN;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Map operators to their properties: precedence and associativity
const OPERATORS = {
  '+': { precedence: 2, association: 'left' },
  '-': { precedence: 2, association: 'left' },
  '*': { precedence: 3, association: 'left' },
  '/': { precedence: 3, association: 'left' },
  '^': { precedence: 4, association: 'right' },
  '_': { precedence: 5, association: 'right' }, // Unary negation
  '!': { precedence: 6, association: 'left' },  // Postfix factorial
};

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'ln', 'log', 'sqrt'
]);

/**
 * Tokenizes a math expression string.
 */
function tokenize(expression) {
  // Normalize symbols
  let expr = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/√/g, 'sqrt'); // In case √ is typed without parenthesis

  // Regex to match numbers (including floats), words (functions & constants), and operators/parentheses
  const regex = /\d+(?:\.\d+)?(?:e[+-]?\d+)?|[a-zA-Z_]+|[+\-*/^!()]/g;
  const rawTokens = expr.match(regex) || [];
  const processedTokens = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];

    // Implicit multiplication detection:
    // e.g., "2(3+4)" -> "2*(3+4)"
    // "pi(2)" -> "pi*(2)"
    // "2 pi" -> "2*pi"
    // "2 sin(30)" -> "2*sin(30)"
    if (i > 0) {
      const prev = processedTokens[processedTokens.length - 1];
      const isCurrentOperand = !isNaN(token) || token === 'pi' || token === 'e' || FUNCTIONS.has(token);
      const isPrevOperand = !isNaN(prev) || prev === 'pi' || prev === 'e' || prev === ')';

      if ((isPrevOperand && isCurrentOperand) || (prev === ')' && token === '(')) {
        processedTokens.push('*');
      }
    }

    // Detect unary operators
    if (token === '-' || token === '+') {
      const isUnary = i === 0 || 
                      processedTokens[processedTokens.length - 1] === '(' ||
                      OPERATORS[processedTokens[processedTokens.length - 1]] !== undefined;
      
      if (isUnary) {
        if (token === '-') {
          processedTokens.push('_'); // Unary minus representation
        }
        // Unary plus can be ignored because +x is just x
        continue;
      }
    }

    processedTokens.push(token);
  }

  return processedTokens;
}

/**
 * Converts infix token array to postfix (Reverse Polish Notation) using Shunting-Yard
 */
function infixToPostfix(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!isNaN(token)) {
      // It's a number
      outputQueue.push({ type: 'NUMBER', value: parseFloat(token) });
    } else if (token === 'pi') {
      outputQueue.push({ type: 'NUMBER', value: Math.PI });
    } else if (token === 'e') {
      outputQueue.push({ type: 'NUMBER', value: Math.E });
    } else if (FUNCTIONS.has(token)) {
      // It's a function
      operatorStack.push({ type: 'FUNCTION', name: token });
    } else if (token === '!') {
      // Factorial is a postfix unary operator, which has extremely high precedence
      outputQueue.push({ type: 'OPERATOR', name: '!' });
    } else if (OPERATORS[token] !== undefined) {
      // It's a binary or prefix unary operator
      const op1 = token;
      let op2 = operatorStack[operatorStack.length - 1];

      while (
        op2 &&
        (op2.type === 'FUNCTION' ||
          (op2.type === 'OPERATOR' &&
            (OPERATORS[op2.name].precedence > OPERATORS[op1].precedence ||
              (OPERATORS[op2.name].precedence === OPERATORS[op1].precedence &&
                OPERATORS[op1].association === 'left'))))
      ) {
        outputQueue.push(operatorStack.pop());
        op2 = operatorStack[operatorStack.length - 1];
      }
      operatorStack.push({ type: 'OPERATOR', name: op1 });
    } else if (token === '(') {
      operatorStack.push({ type: 'PAREN', value: '(' });
    } else if (token === ')') {
      let top = operatorStack[operatorStack.length - 1];
      while (top && (top.type !== 'PAREN' || top.value !== '(')) {
        outputQueue.push(operatorStack.pop());
        top = operatorStack[operatorStack.length - 1];
      }
      if (!top) {
        throw new Error('Mismatched parentheses');
      }
      operatorStack.pop(); // Remove '('
    } else {
      throw new Error(`Unknown token: ${token}`);
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op.type === 'PAREN') {
      throw new Error('Mismatched parentheses');
    }
    outputQueue.push(op);
  }

  return outputQueue;
}

/**
 * Evaluates a postfix token queue
 */
function evaluatePostfix(postfix, isRadian = false) {
  const stack = [];

  for (let i = 0; i < postfix.length; i++) {
    const token = postfix[i];

    if (token.type === 'NUMBER') {
      stack.push(token.value);
    } else if (token.type === 'OPERATOR') {
      if (token.name === '!') {
        const arg = stack.pop();
        if (isNaN(arg)) return NaN;
        stack.push(factorial(arg));
      } else if (token.name === '_') {
        const arg = stack.pop();
        if (isNaN(arg)) return NaN;
        stack.push(-arg);
      } else {
        const b = stack.pop();
        const a = stack.pop();
        if (isNaN(a) || isNaN(b)) return NaN;

        switch (token.name) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '*': stack.push(a * b); break;
          case '/':
            if (b === 0) return Infinity; // Let UI handle Division by Zero
            stack.push(a / b);
            break;
          case '^': stack.push(Math.pow(a, b)); break;
          default: throw new Error(`Unknown operator: ${token.name}`);
        }
      }
    } else if (token.type === 'FUNCTION') {
      let arg = stack.pop();
      if (isNaN(arg)) return NaN;

      // Handle Degree/Radian conversion for trig functions
      let trigArg = arg;
      if (!isRadian && ['sin', 'cos', 'tan'].includes(token.name)) {
        trigArg = (arg * Math.PI) / 180;
      }

      let res;
      switch (token.name) {
        case 'sin':
          // Account for float precision, e.g., sin(180) or sin(pi) should be exactly 0
          res = Math.sin(trigArg);
          if (!isRadian && Math.abs(arg % 180) === 0) res = 0;
          stack.push(res);
          break;
        case 'cos':
          res = Math.cos(trigArg);
          if (!isRadian && Math.abs((arg - 90) % 180) === 0) res = 0;
          stack.push(res);
          break;
        case 'tan':
          if (!isRadian && Math.abs((arg - 90) % 180) === 0) {
            stack.push(Infinity); // Undefined
          } else {
            res = Math.tan(trigArg);
            if (!isRadian && Math.abs(arg % 180) === 0) res = 0;
            stack.push(res);
          }
          break;
        case 'asin':
          res = Math.asin(arg);
          if (!isRadian) res = (res * 180) / Math.PI;
          stack.push(res);
          break;
        case 'acos':
          res = Math.acos(arg);
          if (!isRadian) res = (res * 180) / Math.PI;
          stack.push(res);
          break;
        case 'atan':
          res = Math.atan(arg);
          if (!isRadian) res = (res * 180) / Math.PI;
          stack.push(res);
          break;
        case 'ln':
          if (arg <= 0) return NaN;
          stack.push(Math.log(arg));
          break;
        case 'log':
          if (arg <= 0) return NaN;
          stack.push(Math.log10(arg));
          break;
        case 'sqrt':
          if (arg < 0) return NaN;
          stack.push(Math.sqrt(arg));
          break;
        default:
          throw new Error(`Unknown function: ${token.name}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression evaluation');
  }

  const finalValue = stack[0];
  
  // Format numbers to clean float decimals (e.g. avoid 0.1 + 0.2 = 0.30000000000000004)
  if (typeof finalValue === 'number' && isFinite(finalValue)) {
    // If it's a very small decimal, or simple float, let's format it.
    // We can use a trick: parse the string representation up to 12 decimal places and trim trailing zeroes
    const formatted = parseFloat(finalValue.toFixed(12));
    return formatted;
  }

  return finalValue;
}

/**
 * Public API to parse and evaluate mathematical expressions
 * @param {string} expr Expression string
 * @param {boolean} isRadian Radians or Degrees mode
 * @returns {number|string} Result or error string
 */
export function evaluate(expr, isRadian = false) {
  if (!expr || expr.trim() === '') return 0;
  
  try {
    const tokens = tokenize(expr);
    if (tokens.length === 0) return 0;
    
    const postfix = infixToPostfix(tokens);
    const result = evaluatePostfix(postfix, isRadian);

    if (isNaN(result)) {
      return 'Error';
    }
    if (result === Infinity || result === -Infinity) {
      return 'Undefined';
    }

    return result;
  } catch (err) {
    console.error('Math evaluation error:', err);
    return 'Error';
  }
}
