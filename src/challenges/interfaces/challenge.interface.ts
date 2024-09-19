import { Document } from 'mongoose';
import { ChallengeStatus } from './challenge.status.enum';

export interface Challenge extends Document {
  dateTimeChallenge: Date;
  status: ChallengeStatus;
  dateTimeRequest: Date;
  dateTimeAnswer: Date;
  requester: string;
  category: string;
  players: string[];
  match: string;
}
