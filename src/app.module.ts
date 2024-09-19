import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChallengesModule } from './challenges/challenges.module';
import { MatchModule } from './match/match.module';
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';
import { ConfigModule } from '@nestjs/config';
import { ClientProxySmartRanking } from './proxyrmq/client.proxy.smart.ranking';
import { MongooseModule } from '@nestjs/mongoose';

const connectionMoongoose =
  'mongodb+srv://rgmelo94:qDcOSHhQrrtSdO6e@cluster0.q9qgq6n.mongodb.net/srchallenges?retryWrites=true&w=majority&appName=Cluster0';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ChallengesModule,
    MatchModule,
    ProxyrmqModule,
    MongooseModule.forRoot(connectionMoongoose),
  ],
  controllers: [AppController],
  providers: [AppService, ClientProxySmartRanking],
})
export class AppModule {}
