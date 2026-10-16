import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ObjectSchema, ValidationError } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema<any>) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      // stripUnknown відкидає поля, яких немає в схемі (passwordHash, organizer, id тощо)
      return await this.schema.validate(value, { abortEarly: false, stripUnknown: true });
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new BadRequestException({ message: err.errors.join('; '), errors: err.errors });
      }
      throw err;
    }
  }
}
