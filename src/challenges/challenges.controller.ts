import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Challenge } from './interfaces/challenge.interface';
import { ChallengesService } from './challenges.service';
import { codeErrors } from 'src/errors/codeErros';

@Controller('challenges')
export class ChallengesController {
  private logger = new Logger(ChallengesController.name);

  constructor(private readonly challengesService: ChallengesService) {}

  @EventPattern('create-challenge')
  async createChallenge(
    @Payload() body: Challenge,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const orignalMessage = context.getMessage();

    try {
      this.logger.debug(
        `Received create-challenge event: ${JSON.stringify(body)}`,
      );
      this.challengesService.createChallenge(body);
      await channel.ack(orignalMessage);
    } catch (err) {
      this.logger.error(
        `Error processing create-challenge event: ${err.message}`,
      );

      await channel.ack(orignalMessage);
    }
  }

  @MessagePattern('get-challenges')
  async getChallenges(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<Challenge | Challenge[]> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const { _id } = data;
    try {
      this.logger.debug(
        `Received get-challenges message: ${JSON.stringify(data)}`,
      );

      if (_id) {
        this.logger.debug(`Received get challenge by id ${_id}`);
        return await this.challengesService.getChallengeById(_id);
      }

      return await this.challengesService.getAllChallenges();
    } catch (err) {
      codeErrors.map(async (codeError) => {
        if (err.message.includes(codeError)) {
          await channel.ack(originalMessage);
          this.logger.log(`Category ${JSON.stringify(data)} not updated.`);
          throw new Error(`Category ${data} not updated.`);
        }
      });
    } finally {
      await channel.ack(originalMessage);
    }
  }

  @EventPattern('update-challenge-match')
  async updateChallengeMatch(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`idPartida: ${data}`);
      const matchId: string = data.matchId;
      const challenge: Challenge = data.challenge;
      await this.challengesService.updatedChallengeMatch(matchId, challenge);

      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = codeErrors.filter((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('accept-challenge')
  async acceptChallenge(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const { _id, challengeStatus } = data;

      this.logger.log(
        `Accepting challenge ${JSON.stringify(challengeStatus)} - ${_id}`,
      );
      this.challengesService.acceptChallenge(_id, challengeStatus.status);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = codeErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }
}
