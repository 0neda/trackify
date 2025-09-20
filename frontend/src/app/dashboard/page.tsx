'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import TaskCard from '@/components/tasks/TaskCard';
import TaskColumn from '@/components/tasks/TaskColumn';
import TaskForm from '@/components/tasks/TaskForm';
import { useAuth } from '@/contexts/auth';
import {
   CreateTaskData,
   Task,
   TaskStatus,
   UpdateTaskData,
   tasksApi,
} from '@/lib/api';
import {
   DndContext,
   DragEndEvent,
   DragOverlay,
   DragStartEvent,
   PointerSensor,
   useSensor,
   useSensors,
} from '@dnd-kit/core';
import {
   Button,
   Spinner
} from '@heroui/react';
import {
   PlusIcon
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

const MAIN_STATUSES: TaskStatus[] = [
   TaskStatus.TODO,
   TaskStatus.IN_PROGRESS,
   TaskStatus.DONE,
   TaskStatus.CANCELLED,
];

export default function DashboardPage() {
   const { user, token, isLoading: authLoading } = useAuth();
   const router = useRouter();

   const [tasks, setTasks] = useState<Task[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Modal states
   const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
   const [editingTask, setEditingTask] = useState<Task | undefined>();

   // Drag and drop states
   const [activeTask, setActiveTask] = useState<Task | null>(null);

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            // Require pointer to move 10px before activating
            distance: 10,
         },
      }),
   );

   const handleDragStart = (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks.find((t) => t.id === active.id);
      setActiveTask(task || null);
   };

   const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (over && active.id !== over.id) {
         const activeTask = tasks.find((t) => t.id === active.id);
         const newStatus = over.id as TaskStatus;

         if (!MAIN_STATUSES.includes(newStatus)) return;

         if (activeTask && activeTask.status !== newStatus) {
            setTasks((prevTasks) =>
               prevTasks.map((task) =>
                  task.id === active.id ? { ...task, status: newStatus } : task,
               ),
            );

            try {
               await handleStatusChange(active.id as number, newStatus);
            } catch (err) {
               setError('Falha ao atualizar o status. Revertendo.');
               setTasks((prevTasks) =>
                  prevTasks.map((task) =>
                     task.id === active.id
                        ? { ...task, status: activeTask.status }
                        : task,
                  ),
               );
            }
         }
      }
   };

   // Redirect to login only after auth state is resolved
   useEffect(() => {
      if (!authLoading && !user) {
         router.replace('/login');
      }
   }, [authLoading, user, router]);

   // Fetch tasks on component mount
   useEffect(() => {
      if (user && token) {
         fetchTasks();
      }
   }, [user, token]);

   const fetchTasks = async () => {
      try {
         setLoading(true);
         setError(null);
         const fetchedTasks = await tasksApi.getAll(token!);
         setTasks(fetchedTasks);
      } catch (err) {
         console.error('Error fetching tasks:', err);
         setError('Erro ao carregar tarefas');
      } finally {
         setLoading(false);
      }
   };

   const handleCreateTask = () => {
      setEditingTask(undefined);
      setIsTaskFormOpen(true);
   };

   const handleEditTask = (task: Task) => {
      setEditingTask(task);
      setIsTaskFormOpen(true);
   };

   const handleDeleteTask = async (taskId: number) => {
      if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

      try {
         await tasksApi.delete(taskId, token!);
         setTasks((prev) => prev.filter((task) => task.id !== taskId));
      } catch (err) {
         console.error('Error deleting task:', err);
         setError('Erro ao excluir tarefa');
      }
   };

   const handleTaskSubmit = async (data: CreateTaskData | UpdateTaskData) => {
      try {
         if (editingTask) {
            // Update
            const updatedTask = await tasksApi.update(
               editingTask.id,
               data as UpdateTaskData,
               token!,
            );
            setTasks((prev) =>
               prev.map((task) =>
                  task.id === editingTask.id ? updatedTask : task,
               ),
            );
         } else {
            // Create
            const newTask = await tasksApi.create(data as CreateTaskData, token!);
            setTasks((prev) => [...prev, newTask]);
         }
      } catch (err) {
         console.error('Error saving task:', err);
         throw err; // Re-throw to let the form handle it
      }
   };

   const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
      try {
         const updatedTask = await tasksApi.update(
            taskId,
            { status: newStatus },
            token!,
         );
         setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? updatedTask : task)),
         );
      } catch (err) {
         console.error('Error updating task status:', err);
         setError('Erro ao atualizar status da tarefa');
         throw err; // Re-throw to allow caller to handle it
      }
   };

   const handleAddObservation = async (taskId: number, content: string) => {
      try {
         const task = tasks.find(t => t.id === taskId);
         const existing = task?.observations || '';
         const joined = existing ? `${existing}\n${content}` : content;
         const updated = await tasksApi.update(taskId, { observations: joined }, token!);
         setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      } catch (err) {
         console.error('Error adding observation:', err);
         setError('Erro ao adicionar observação');
         throw err;
      }
   };

   const tasksByStatus = useMemo(() => {
      const grouped: { [key in TaskStatus]?: Task[] } = {};
      for (const status of MAIN_STATUSES) {
         grouped[status] = tasks.filter((task) => task.status === status);
      }
      return grouped;
   }, [tasks]);

   // Refs for mobile scroll-to-column navigation
   const colRefs = useRef<Record<TaskStatus, HTMLDivElement | null>>({
      [TaskStatus.TODO]: null,
      [TaskStatus.IN_PROGRESS]: null,
      [TaskStatus.DONE]: null,
      [TaskStatus.CANCELLED]: null,
      [TaskStatus.REVIEW]: null,
      [TaskStatus.BLOCKED]: null,
   });

   const scrollToStatus = (status: TaskStatus) => {
      const el = colRefs.current[status];
      if (el) {
         el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
   };

   // While resolving auth state, show a spinner
   if (authLoading || loading) {
      return (
         <div className="flex h-screen items-center justify-center">
            <Spinner size="lg" />
         </div>
      );
   }

   if (!user) {
      // Auth resolved and user not present; let redirect effect handle navigation
      return null;
   }

   return (
      <MainLayout>
         <div className="flex items-center justify-between mb-6">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Painel de Tarefas</h1>
               <p className="text-gray-500">Visualize e gerencie seu fluxo de trabalho.</p>
            </div>
            <Button onClick={handleCreateTask} startContent={<PlusIcon size={18} />} color="success" className="font-semibold text-white shadow-lg hover:shadow-xl transition-shadow">
               Nova Tarefa
            </Button>
         </div>

         {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
               {error}
            </div>
         )}

         <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            {/* Mobile status navigator */}
            <div className="md:hidden sticky top-0 z-10 -mt-2 mb-2 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 px-1 py-2 rounded">
               <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {MAIN_STATUSES.map((status) => (
                     <Button key={status} size="sm" variant="flat" onClick={() => scrollToStatus(status)}>
                        {status === TaskStatus.TODO && 'A Fazer'}
                        {status === TaskStatus.IN_PROGRESS && 'Em Andamento'}
                        {status === TaskStatus.DONE && 'Concluída'}
                        {status === TaskStatus.CANCELLED && 'Cancelada'}
                     </Button>
                  ))}
               </div>
            </div>

            {/* Columns: flex-scroll on mobile, grid on md+ */}
            <div className="flex md:grid flex-1 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-2 md:pb-0 md:grid-cols-2 xl:grid-cols-4">
               {MAIN_STATUSES.map((status) => (
                  <div
                     key={status}
                     ref={(el) => { colRefs.current[status] = el; }}
                     className="snap-start shrink-0 w-[88vw] sm:w-[70vw] md:w-auto"
                  >
                     <TaskColumn
                        status={status}
                        tasks={tasksByStatus[status] || []}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                        onAddObservation={handleAddObservation}
                     />
                  </div>
               ))}
            </div>

            <DragOverlay>
               {activeTask ? (
                  <TaskCard
                     task={activeTask}
                     onEdit={() => { }}
                     onDelete={() => { }}
                     onStatusChange={() => { }}
                     onAddObservation={async () => { }}
                     isDragging
                  />
               ) : null}
            </DragOverlay>
         </DndContext>

         <TaskForm
            isOpen={isTaskFormOpen}
            onClose={() => setIsTaskFormOpen(false)}
            onSubmit={handleTaskSubmit}
            task={editingTask}
            mode={editingTask ? 'edit' : 'create'}
         />
      </MainLayout>
   );
}
