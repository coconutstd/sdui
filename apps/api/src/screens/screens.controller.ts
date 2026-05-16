import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ScreensService } from './screens.service';
import type { ScreenMeta } from './screens.service';
import type { SDUIScreen } from '@sdui/schema';

@Controller('screens')
export class ScreensController {
  constructor(private readonly screensService: ScreensService) {}

  @Get()
  findAll(): ScreenMeta[] {
    return this.screensService.findAll();
  }

  @Get(':screenId')
  findOne(@Param('screenId') screenId: string): SDUIScreen {
    return this.screensService.findOne(screenId);
  }

  @Put(':screenId')
  update(
    @Param('screenId') screenId: string,
    @Body() screen: SDUIScreen,
  ): SDUIScreen {
    return this.screensService.update(screenId, screen);
  }
}
