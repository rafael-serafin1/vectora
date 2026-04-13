import fs from 'fs';
import { lexer } from '../dist/lexer.js';
import { parser } from '../dist/AST.js';

const source = fs.readFileSync(new URL('../anim.vec', import.meta.url), 'utf8');
const tokens = lexer(source);
console.log('Total tokens:', tokens.length);
for (let i = 0; i < tokens.length; i += 40) {
  console.log(tokens.slice(i, i + 40).map((t, idx) => `${i + idx}:${t.type}:${t.value ?? ''}`).join(' | '));
}

try {
  parser(tokens);
  console.log('PARSED OK');
} catch (error) {
  console.error('PARSE ERROR', error.message);
}
