import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScreensModule } from './screens/screens.module';

@Module({
  imports: [ScreensModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
