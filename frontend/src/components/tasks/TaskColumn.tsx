'use client';

import { Task, TaskStatus } from '@/lib/api';
import { useDroppable } from '@dnd-kit/core';
import {
   SortableContext,
   verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Chip } from '@heroui/react';
import {
   CheckCircleIcon,
   ClockIcon,
   ListChecksIcon,
   WarningIcon,
   XCircleIcon,
} from '@phosphor-icons/react';
import React from 'react';
import TaskCard from './TaskCard';

interface TaskColumnProps {
   status: TaskStatus;
   tasks: Task[];
   onEditTask: (task: Task) => void;
   onDeleteTask: (taskId: number) => void;
   onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
   onAddObservation?: (taskId: number, content: string) => Promise<void>;
}

const statusConfig = {
   [TaskStatus.TODO]: {
      label: 'A Fazer',
      icon: <ListChecksIcon size={20} />,
      gradient: 'from-gray-100 to-gray-200',
      bgColor: 'bg-gray-50/30',
      borderColor: 'border-gray-200/50',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-700',
      chipColor: 'default' as const,
   },
   [TaskStatus.IN_PROGRESS]: {
      label: 'Em Andamento',
      icon: <ClockIcon size={20} />,
      gradient: 'from-blue-100 to-blue-200',
      bgColor: 'bg-blue-50/30',
      borderColor: 'border-blue-200/50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
      chipColor: 'primary' as const,
   },
   [TaskStatus.DONE]: {
      label: 'Concluída',
      icon: <CheckCircleIcon size={20} />,
      gradient: 'from-green-100 to-green-200',
      bgColor: 'bg-green-50/30',
      borderColor: 'border-green-200/50',
      iconColor: 'text-green-600',
      textColor: 'text-green-700',
      chipColor: 'success' as const,
   },
   [TaskStatus.CANCELLED]: {
      label: 'Cancelada',
      icon: <XCircleIcon size={20} />,
      gradient: 'from-red-100 to-red-200',
      bgColor: 'bg-red-50/30',
      borderColor: 'border-red-200/50',
      iconColor: 'text-red-600',
      textColor: 'text-red-700',
      chipColor: 'danger' as const,
   },
   [TaskStatus.REVIEW]: {
      label: 'Revisão',
      icon: <WarningIcon size={20} />,
      gradient: 'from-yellow-100 to-yellow-200',
      bgColor: 'bg-yellow-50/30',
      borderColor: 'border-yellow-200/50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-700',
      chipColor: 'warning' as const,
   },
   [TaskStatus.BLOCKED]: {
      label: 'Bloqueada',
      icon: <XCircleIcon size={20} />,
      gradient: 'from-orange-100 to-orange-200',
      bgColor: 'bg-orange-50/30',
      borderColor: 'border-orange-200/50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-700',
      chipColor: 'warning' as const,
   },
};

const TaskColumn: React.FC<TaskColumnProps> = ({
   status,
   tasks,
   onEditTask,
   onDeleteTask,
   onStatusChange,
   onAddObservation,
}) => {
   const { setNodeRef, isOver } = useDroppable({
      id: status,
   });

   const config = statusConfig[status];

   return (
      <div
         ref={setNodeRef}
         className={`rounded-2xl border-2 transition-all duration-300 min-h-[500px] ${config.bgColor
            } ${config.borderColor} ${isOver ? 'border-dashed scale-[1.02] shadow-lg' : 'border-solid hover:shadow-md'
            }`}
      >
         {/* Header with subtle gradient */}
         <div className={`bg-gradient-to-r ${config.gradient} rounded-t-xl p-4 border-b border-gray-200/30 backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${config.iconColor} bg-white/60 shadow-sm`}>
                     {config.icon}
                  </div>
                  <h3 className={`font-semibold text-lg ${config.textColor}`}>{config.label}</h3>
               </div>
               <Chip
                  size="md"
                  variant="flat"
                  color={config.chipColor}
                  className="font-medium"
               >
                  {tasks.length}
               </Chip>
            </div>
         </div>

         {/* Tasks Container */}
         <div className="p-4 space-y-2">
            <SortableContext
               items={tasks.map((task) => task.id)}
               strategy={verticalListSortingStrategy}
            >
               {tasks.length > 0 ? (
                  tasks.map((task) => (
                     <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onStatusChange={onStatusChange}
                        onAddObservation={onAddObservation}
                     />
                  ))
               ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                     <div className={`w-12 h-12 rounded-full ${config.iconColor} opacity-30 mb-3 flex items-center justify-center`}>
                        {config.icon}
                     </div>
                     <p className="text-sm text-gray-500 font-medium">
                        Nenhuma tarefa aqui
                     </p>
                     <p className="text-xs text-gray-400 mt-1">
                        Arraste tarefas para esta coluna
                     </p>
                  </div>
               )}
            </SortableContext>
         </div>
      </div>
   );
};

export default TaskColumn;
