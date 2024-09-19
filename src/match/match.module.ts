import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchSchema } from './interfaces/match.schema';
import { ProxyrmqModule } from 'src/proxyrmq/proxyrmq.module';
import { MatchController } from './match.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Match', schema: MatchSchema }]),
    ProxyrmqModule,
  ],

  providers: [MatchService],

  controllers: [MatchController],
})
export class MatchModule {}
