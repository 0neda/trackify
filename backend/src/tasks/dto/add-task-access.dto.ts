import { IsIn, IsInt } from 'class-validator';

export class AddTaskAccessDto {
  @IsInt()
  userId: number;

  @IsIn(['view', 'edit'])
  accessLevel: string;
}
