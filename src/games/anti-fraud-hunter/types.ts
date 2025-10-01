export interface SMSMessage {
  id: number;
  text: string;
  sender: string;
  isFraud: boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
