'use client';

import { CreateTaskData, Task, TaskPriority, TaskStatus, UpdateTaskData } from '@/lib/api';
import {
   Button,
   Input,
   Modal,
   ModalBody,
   ModalContent,
   ModalFooter,
   ModalHeader,
   Select,
   SelectItem,
   Textarea
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const taskSchema = z.object({
   title: z.string().trim().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres'),
   description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
   status: z.nativeEnum(TaskStatus).optional(),
   priority: z.nativeEnum(TaskPriority).optional(),
   startDate: z.string().optional(),
   dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
   task?: Task;
   mode: 'create' | 'edit';
}

const priorityOptions = [
   { key: TaskPriority.LOW, label: 'Baixa' },
   { key: TaskPriority.MEDIUM, label: 'Média' },
   { key: TaskPriority.HIGH, label: 'Alta' },
   { key: TaskPriority.URGENT, label: 'Urgente' },
];

const statusOptions = [
   { key: TaskStatus.TODO, label: 'A Fazer' },
   { key: TaskStatus.IN_PROGRESS, label: 'Em Andamento' },
   { key: TaskStatus.REVIEW, label: 'Revisão' },
   { key: TaskStatus.BLOCKED, label: 'Bloqueada' },
   { key: TaskStatus.DONE, label: 'Concluída' },
   { key: TaskStatus.CANCELLED, label: 'Cancelada' },
];

export default function TaskForm({ isOpen, onClose, onSubmit, task, mode }: TaskFormProps) {
   const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

   const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      setValue,
   } = useForm<TaskFormData>({
      resolver: zodResolver(taskSchema),
      defaultValues: {
         title: '',
         description: '',
         status: TaskStatus.TODO,
         priority: TaskPriority.MEDIUM,
         startDate: today,
         dueDate: today,
      },
   });

   // Effect to update form when task prop changes
   useEffect(() => {
      if (isOpen && task) {
         setValue('title', task.title);
         setValue('description', task.description || '');
         setValue('status', task.status);
         setValue('priority', task.priority);
         setValue('startDate', task.startDate ? task.startDate.split('T')[0] : today);
         setValue('dueDate', task.dueDate ? task.dueDate.split('T')[0] : today);
      } else if (isOpen && !task) {
         // Reset to default for 'create' mode
         reset({
            title: '',
            description: '',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            startDate: today,
            dueDate: today,
         });
      }
   }, [isOpen, task, setValue, reset, today]);

   const handleFormSubmit = async (data: TaskFormData) => {
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Raw form data:', data);
      console.log('Has title property:', 'title' in data);
      console.log('Title value:', data.title);
      console.log('Title type:', typeof data.title);
      console.log('Title length:', data.title?.length);
      console.log('Title trimmed:', data.title?.trim());
      console.log('Title trimmed length:', data.title?.trim()?.length);
      console.log('===========================');

      try {
         const submitData = {
            ...data,
            description: data.description || undefined,
            startDate: data.startDate || undefined,
            dueDate: data.dueDate || undefined,
         };

         console.log('Final submit data:', submitData);

         await onSubmit(submitData);
         reset();
         onClose();
      } catch (error) {
         console.error('Error submitting task:', error);
         // Re-throw the error to be caught by the calling component, which can show a toast or message.
         throw error;
      }
   };

   const handleClose = () => {
      reset();
      onClose();
   };

   return (
      <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
         <ModalContent>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
               <ModalHeader>
                  {mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}
               </ModalHeader>
               <ModalBody className="gap-4">
                  <Controller
                     name="title"
                     control={control}
                     render={({ field }) => (
                        <Input
                           label="Título"
                           placeholder="Digite o título da tarefa"
                           value={field.value ?? ''}
                           onValueChange={field.onChange}
                           onBlur={field.onBlur}
                           name={field.name}
                           ref={field.ref}
                           isInvalid={!!errors.title}
                           errorMessage={errors.title?.message}
                           isRequired
                        />
                     )}
                  />

                  <Controller
                     name="description"
                     control={control}
                     render={({ field }) => (
                        <Textarea
                           label="Descrição"
                           placeholder="Descreva a tarefa (opcional)"
                           value={field.value ?? ''}
                           onValueChange={field.onChange}
                           onBlur={field.onBlur}
                           name={field.name}
                           ref={field.ref}
                           isInvalid={!!errors.description}
                           errorMessage={errors.description?.message}
                           minRows={3}
                        />
                     )}
                  />

                  {/* Observações removidas deste formulário conforme solicitado */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                           <Select
                              selectedKeys={field.value ? [field.value] : []}
                              onSelectionChange={(keys) => {
                                 const selected = Array.from(keys)[0] as TaskPriority;
                                 field.onChange(selected);
                              }}
                              label="Prioridade"
                              placeholder="Selecione a prioridade"
                              isInvalid={!!errors.priority}
                              errorMessage={errors.priority?.message}
                           >
                              {priorityOptions.map((option) => (
                                 <SelectItem key={option.key}>
                                    {option.label}
                                 </SelectItem>
                              ))}
                           </Select>
                        )}
                     />

                     <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                           <Select
                              selectedKeys={field.value ? [field.value] : []}
                              onSelectionChange={(keys) => {
                                 const selected = Array.from(keys)[0] as TaskStatus;
                                 field.onChange(selected);
                              }}
                              label="Status"
                              placeholder="Selecione o status"
                              isInvalid={!!errors.status}
                              errorMessage={errors.status?.message}
                           >
                              {statusOptions.map((option) => (
                                 <SelectItem key={option.key}>
                                    {option.label}
                                 </SelectItem>
                              ))}
                           </Select>
                        )}
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                           <Input
                              type="date"
                              label="Data de Início"
                              value={field.value ?? ''}
                              onValueChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              isInvalid={!!errors.startDate}
                              errorMessage={errors.startDate?.message}
                           />
                        )}
                     />

                     <Controller
                        name="dueDate"
                        control={control}
                        render={({ field }) => (
                           <Input
                              type="date"
                              label="Data de Vencimento"
                              value={field.value ?? ''}
                              onValueChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              isInvalid={!!errors.dueDate}
                              errorMessage={errors.dueDate?.message}
                           />
                        )}
                     />
                  </div>
               </ModalBody>
               <ModalFooter>
                  <Button variant="flat" onClick={handleClose}>
                     Cancelar
                  </Button>
                  <Button
                     color="primary"
                     type="submit"
                     isLoading={isSubmitting}
                  >
                     {mode === 'create' ? 'Criar Tarefa' : 'Salvar Alterações'}
                  </Button>
               </ModalFooter>
            </form>
         </ModalContent>
      </Modal>
   );
}
