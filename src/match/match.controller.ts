import { Controller, Logger } from '@nestjs/common';
import { MatchService } from './match.service';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { Match } from './interfaces/match.interface';
import { codeErrors } from 'src/errors/codeErros';

@Controller('match')
export class MatchController {
  private logger = new Logger(MatchController.name);

  constructor(private readonly matchService: MatchService) {}

  @EventPattern('create-match')
  async createMatch(@Payload() match: Match, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.debug(
        `Received create-match event: ${JSON.stringify(match)}`,
      );

      await this.matchService.createMatch(match);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`);

      const filterAckError = codeErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }

      throw new RpcException(error);
    }
  }
}
