import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Task, TaskAccess } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddTaskAccessDto } from './dto/add-task-access.dto';
import { AddTaskDependencyDto } from './dto/add-task-dependency.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface TaskWithAccess extends Task {
  creator: {
    id: number;
    username: string;
  };
  taskAccess: TaskAccess[];
  dependencies: Array<{
    dependsOn: {
      id: number;
      title: string;
      status: string;
    };
  }>;
  dependedBy: Array<{
    task: {
      id: number;
      title: string;
      status: string;
    };
  }>;
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(creatorId: number, dto: CreateTaskDto): Promise<Task> {
    return this.prisma.$transaction(async (tx) => {
      // Create the task
      const task = await tx.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          observations: dto.observations,
          status: dto.status || 'TODO',
          priority: dto.priority || 'MEDIUM',
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          creatorId,
        },
      });

      // Return the complete task with all relations
      return this.findOne(task.id, creatorId, tx);
    });
  }

  async findAllForUser(userId: number): Promise<TaskWithAccess[]> {
    const where: Prisma.TaskWhereInput = {
      OR: [
        // Tasks created by the user
        { creatorId: userId },
        // Tasks the user has explicit access to
        {
          taskAccess: {
            some: { userId },
          },
        },
      ],
    };

    return this.prisma.task.findMany({
      where,
      include: {
        creator: {
          select: { id: true, username: true },
        },
        taskAccess: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
        dependencies: {
          include: {
            dependsOn: {
              select: { id: true, title: true, status: true },
            },
          },
        },
        dependedBy: {
          include: {
            task: {
              select: { id: true, title: true, status: true },
            },
          },
        },
      },
      orderBy: [
        { startDate: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { updatedAt: 'desc' },
      ],
    }) as Promise<TaskWithAccess[]>;
  }

  async findOne(
    taskId: number,
    userId: number,
    prismaClient: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<TaskWithAccess> {
    const task = await prismaClient.task.findUnique({
      where: { id: taskId },
      include: {
        creator: {
          select: { id: true, username: true },
        },
        taskAccess: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
        dependencies: {
          include: {
            dependsOn: {
              select: { id: true, title: true, status: true },
            },
          },
        },
        dependedBy: {
          include: {
            task: {
              select: { id: true, title: true, status: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check access permissions
    await this.validateTaskAccess(task, userId, 'view', prismaClient);

    return task as TaskWithAccess;
  }

  async update(
    taskId: number,
    userId: number,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        taskAccess: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check edit permissions
    await this.validateTaskAccess(task, userId, 'edit');

    const data: Prisma.TaskUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.observations !== undefined) data.observations = dto.observations;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    await this.prisma.task.update({
      where: { id: taskId },
      data,
    });

    return this.findOne(taskId, userId);
  }

  async remove(taskId: number, userId: number): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Only creator can delete
    if (task.creatorId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this task');
    }

    return this.prisma.task.delete({
      where: { id: taskId },
      include: {
        creator: {
          select: { id: true, username: true },
        },
      },
    });
  }

  async addTaskAccess(
    taskId: number,
    userId: number,
    dto: AddTaskAccessDto,
  ): Promise<TaskAccess> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Only creator can grant access
    if (task.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to grant access to this task',
      );
    }

    // Check if user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!targetUser) {
      throw new ForbiddenException('Target user not found');
    }

    // Create or update access
    return this.prisma.taskAccess.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId: dto.userId,
        },
      },
      update: {
        accessLevel: dto.accessLevel,
      },
      create: {
        taskId,
        userId: dto.userId,
        accessLevel: dto.accessLevel,
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });
  }

  async addTaskDependency(
    taskId: number,
    userId: number,
    dto: AddTaskDependencyDto,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check edit permissions
    await this.validateTaskAccess(task, userId, 'edit');

    // Validate that all dependency tasks exist
    const dependencyTasks = await this.prisma.task.findMany({
      where: {
        id: { in: dto.dependsOnTaskIds },
      },
    });

    if (dependencyTasks.length !== dto.dependsOnTaskIds.length) {
      throw new ForbiddenException('One or more dependency tasks not found');
    }

    // Check for circular dependencies
    for (const dependsOnId of dto.dependsOnTaskIds) {
      const wouldCreateCircularDependency = await this.checkCircularDependency(
        dependsOnId,
        taskId,
      );
      if (wouldCreateCircularDependency) {
        throw new ForbiddenException(
          'Cannot create dependency - would result in circular dependency',
        );
      }
    }

    // Create dependencies
    for (const dependsOnId of dto.dependsOnTaskIds) {
      await this.prisma.taskDependency.upsert({
        where: {
          taskId_dependsOnId: {
            taskId,
            dependsOnId,
          },
        },
        update: {},
        create: {
          taskId,
          dependsOnId,
        },
      });
    }
  }

  async removeTaskDependency(
    taskId: number,
    userId: number,
    dependsOnId: number,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check edit permissions
    await this.validateTaskAccess(task, userId, 'edit');

    await this.prisma.taskDependency.deleteMany({
      where: {
        taskId,
        dependsOnId,
      },
    });
  }

  async removeTaskAccess(
    taskId: number,
    userId: number,
    targetUserId: number,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Only creator can revoke access
    if (task.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to revoke access to this task',
      );
    }

    await this.prisma.taskAccess.deleteMany({
      where: {
        taskId,
        userId: targetUserId,
      },
    });
  }

  private async validateTaskAccess(
    task: any,
    userId: number,
    requiredAccess: 'view' | 'edit',
    prismaClient: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    // Creator always has full access
    if (task.creatorId === userId) {
      return;
    }

    // Check explicit task access
    const taskAccess = task.taskAccess.find(
      (access: any) => access.userId === userId,
    );
    if (taskAccess) {
      if (requiredAccess === 'view') {
        return;
      }
      if (requiredAccess === 'edit' && taskAccess.accessLevel === 'edit') {
        return;
      }
    }

    throw new ForbiddenException(
      `You do not have ${requiredAccess} access to this task`,
    );
  }

  private async checkCircularDependency(
    fromTaskId: number,
    toTaskId: number,
    visited: Set<number> = new Set(),
  ): Promise<boolean> {
    if (fromTaskId === toTaskId) {
      return true; // Circular dependency detected
    }

    if (visited.has(fromTaskId)) {
      return false; // Already visited, no circular dependency in this path
    }

    visited.add(fromTaskId);

    // Get all tasks that fromTaskId depends on
    const dependencies = await this.prisma.taskDependency.findMany({
      where: { taskId: fromTaskId },
      select: { dependsOnId: true },
    });

    for (const dep of dependencies) {
      if (
        await this.checkCircularDependency(dep.dependsOnId, toTaskId, visited)
      ) {
        return true;
      }
    }

    visited.delete(fromTaskId);
    return false;
  }
}
