export type MathGameOption = {
  id: string;
  label: string;
};

export type MathGame = {
  id: string;
  question: string;
  type: 'addition-subtraction' | 'pattern' | 'comparison';
  options: MathGameOption[];
  correctOptionId: string;
};
