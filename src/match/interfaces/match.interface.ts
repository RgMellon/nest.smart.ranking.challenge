import { Document } from 'mongoose';

export interface Match extends Document {
  category: string;
  challenge: string;
  players: string[];
  def: string;
  score: Result[];
}

export interface Result {
  set: string;
}
