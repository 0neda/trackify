import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddTaskAccessDto } from './dto/add-task-access.dto';
import { AddTaskDependencyDto } from './dto/add-task-dependency.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService, TaskWithAccess } from './tasks.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: number;
    username: string;
  };
}

@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @Request() req: AuthenticatedRequest) {
    console.log('=== BACKEND CREATE DEBUG ===');
    console.log('Received DTO:', dto);
    console.log('Title value:', dto.title);
    console.log('Title type:', typeof dto.title);
    console.log('Title length:', dto.title?.length);
    console.log('===========================');
    return this.tasksService.create(req.user.id, dto);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<TaskWithAccess[]> {
    return this.tasksService.findAllForUser(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ): Promise<TaskWithAccess> {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Post(':id/access')
  addAccess(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddTaskAccessDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.addTaskAccess(id, req.user.id, dto);
  }

  @Delete(':id/access/:userId')
  removeAccess(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.removeTaskAccess(id, req.user.id, userId);
  }

  @Post(':id/dependencies')
  addDependencies(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddTaskDependencyDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.addTaskDependency(id, req.user.id, dto);
  }

  @Delete(':id/dependencies/:dependsOnId')
  removeDependency(
    @Param('id', ParseIntPipe) id: number,
    @Param('dependsOnId', ParseIntPipe) dependsOnId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.removeTaskDependency(id, req.user.id, dependsOnId);
  }
}
