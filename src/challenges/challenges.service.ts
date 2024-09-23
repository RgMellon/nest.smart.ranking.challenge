import { Injectable, Logger } from '@nestjs/common';
import { Challenge } from './interfaces/challenge.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxySmartRanking } from 'src/proxyrmq/client.proxy.smart.ranking';
import { ChallengeStatus } from './interfaces/challenge.status.enum';
import { RpcException } from '@nestjs/microservices';
import { toZonedTime } from 'date-fns-tz';
import { endOfDay } from 'date-fns';

@Injectable()
export class ChallengesService {
  private readonly logger = new Logger(ChallengesService.name);

  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  async createChallenge(payload: Challenge): Promise<void> {
    try {
      const createdChallenge = new this.challengeModel(payload);
      createdChallenge.dateTimeRequest = new Date();
      createdChallenge.status = ChallengeStatus.PENDING;
      this.logger.log(`desafioCriado: ${JSON.stringify(createdChallenge)}`);

      const response = await createdChallenge.save();
      console.log(response);
    } catch (err) {
      this.logger.error(
        `Error during challenge creation: ${err.message || err} - Stack ${err.stack}`,
      );

      throw err;
    }
  }

  async getAllChallenges(): Promise<Challenge[]> {
    try {
      return await this.challengeModel.find().exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async gerPlayerChallenges(_id: any): Promise<Challenge[] | Challenge> {
    try {
      return await this.challengeModel.find().where('jogadores').in(_id).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getChallengeById(_id: any): Promise<Challenge> {
    this.logger.debug(`getChallengeById ${_id}`);

    try {
      return await this.challengeModel.findOne({ _id }).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async deleteChallenge(challenge: Challenge): Promise<void> {
    try {
      const { _id } = challenge;

      challenge.status = ChallengeStatus.CANCELLED;
      this.logger.log(`desafio: ${JSON.stringify(challenge)}`);
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challenge })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updatedChallengeMatch(
    matchId: string,
    challenge: Challenge,
  ): Promise<void> {
    try {
      challenge.status = ChallengeStatus.COMPLETED;
      challenge.match = matchId;
      await this.challengeModel
        .findOneAndUpdate({ _id: challenge._id }, { $set: challenge })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async acceptChallenge(_id: string, payload: ChallengeStatus): Promise<void> {
    try {
      const foundChallenge = await this.challengeModel.findById(_id).exec();

      if (!foundChallenge) {
        throw new RpcException(`Desafio ${_id} não cadastrado!`);
      }

      if (foundChallenge.status) {
        foundChallenge.dateTimeAnswer = new Date();
      }

      foundChallenge.status = payload;

      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: foundChallenge })
        .exec();
    } catch (err) {
      console.log('error', err);
      throw new RpcException(err.message);
    }
  }

  async getCompletedChallengesByDate(
    category: string,
    dateRef: string,
  ): Promise<Challenge[]> {
    try {
      const dateRefObj = new Date(dateRef);
      const endDate = endOfDay(dateRefObj);

      const endDateInUTC = toZonedTime(endDate, 'UTC');
      this.logger.debug(
        `${endDate.getTime()} getCompletedChallengesByDate-date`,
      );

      this.logger.debug(`${endDateInUTC} getCompletedChallengesByDate-date`);

      return await this.challengeModel
        .find()
        .where('category')
        .equals(category)
        .where('status')
        .equals(ChallengeStatus.COMPLETED)
        .where('dateTimeChallenge')
        .lte(endDateInUTC.getTime())
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getCompletedChallenges(category: string): Promise<Challenge[]> {
    try {
      return await this.challengeModel
        .find()
        .where('category')
        .equals(category)
        .where('status')
        .equals(ChallengeStatus.COMPLETED)
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
