import { Controller, Get } from '@nestjs/common';
import { ApiDataOutput } from './types';

@Controller()
export class AppController {
  @Get('')
  getHealthCheck(): ApiDataOutput<string> {
    return { data: 'ok' };
  }
}
