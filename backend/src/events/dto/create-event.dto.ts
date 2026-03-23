import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMaxSize, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Date must be a valid date string' })
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array of strings' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @ArrayMaxSize(5, { message: 'Maximum 5 tags allowed per event' })
  tags?: string[];
}