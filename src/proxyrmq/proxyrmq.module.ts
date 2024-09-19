import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientProxySmartRanking } from './client.proxy.smart.ranking';

@Module({
  imports: [ConfigModule],
  providers: [ClientProxySmartRanking],
  exports: [ClientProxySmartRanking],
})
export class ProxyrmqModule {}
