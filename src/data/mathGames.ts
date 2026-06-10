import type { MathGame } from '../types/mathGame';

export const mathGames: MathGame[] = [
  {
    id: 'math-3-plus-4',
    question: '3 + 4 = ?',
    type: 'addition-subtraction',
    options: [
      { id: '6', label: '6' },
      { id: '7', label: '7' },
      { id: '8', label: '8' },
    ],
    correctOptionId: '7',
  },
  {
    id: 'math-12-minus-5',
    question: '12 - 5 = ?',
    type: 'addition-subtraction',
    options: [
      { id: '5', label: '5' },
      { id: '7', label: '7' },
      { id: '9', label: '9' },
    ],
    correctOptionId: '7',
  },
  {
    id: 'math-pattern-2-4-6',
    question: '2, 4, 6, ?',
    type: 'pattern',
    options: [
      { id: '7', label: '7' },
      { id: '8', label: '8' },
      { id: '10', label: '10' },
    ],
    correctOptionId: '8',
  },
  {
    id: 'math-pattern-5-10-15',
    question: '5, 10, 15, ?',
    type: 'pattern',
    options: [
      { id: '18', label: '18' },
      { id: '20', label: '20' },
      { id: '25', label: '25' },
    ],
    correctOptionId: '20',
  },
  {
    id: 'math-compare-14-9',
    question: '14 和 9，哪个更大？',
    type: 'comparison',
    options: [
      { id: '14', label: '14' },
      { id: '9', label: '9' },
      { id: 'same', label: '一样大' },
    ],
    correctOptionId: '14',
  },
];
