import { IsArray, IsInt } from 'class-validator';

export class AddTaskDependencyDto {
  @IsArray()
  @IsInt({ each: true })
  dependsOnTaskIds: number[];
}
