import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z, ZodRawShape } from 'zod';

@Injectable()
export class ZodValidationPipe<T extends ZodRawShape> implements PipeTransform {
  constructor(private schema: z.ZodObject<T>) {}

  transform(value: T) {
    const validationResult = this.schema.safeParse(value);

    if (!validationResult.success) {
      throw new BadRequestException(validationResult.error.errors);
    }

    return validationResult.data;
  }
}
