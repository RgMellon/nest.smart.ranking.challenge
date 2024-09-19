import { Injectable, Logger } from '@nestjs/common';
import { Match } from './interfaces/match.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Challenge } from 'src/challenges/interfaces/challenge.interface';
import { ClientProxySmartRanking } from 'src/proxyrmq/client.proxy.smart.ranking';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);
  private clientChallenge =
    this.clientProxySmartRanking.getClientProxyChallengesInstance();
  private clientRanking =
    this.clientProxySmartRanking.getClientProxyRankingInstance();

  constructor(
    @InjectModel('Match') private readonly matchModel: Model<Match>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  async createMatch(match: Match) {
    const createdMatch = new this.matchModel(match);
    this.logger.log(`partidaCriada: ${JSON.stringify(createdMatch)}`);

    const result = await createdMatch.save();
    this.logger.log(`result: ${JSON.stringify(result)}`);
    const matchId = result._id;

    const challenge: Challenge = await this.clientChallenge
      .send('get-challenges', { idJogador: '', _id: match.challenge })
      .toPromise();

    this.logger.log(`challenges: ${JSON.stringify(challenge)}`);

    await this.clientChallenge
      .emit('update-challenge-match', {
        matchId,
        challenge,
      })
      .toPromise();

    return this.clientRanking.emit('proccess-match', {
      match,
      matchId,
    });
  }
}
