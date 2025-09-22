'use client';

import { Task, TaskPriority, TaskStatus } from '@/lib/api';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
   Avatar,
   AvatarGroup,
   Button,
   Card,
   CardBody,
   Modal,
   ModalBody,
   ModalContent,
   ModalFooter,
   ModalHeader,
   Tooltip,
   useDisclosure
} from '@heroui/react';
import {
   ChatCircleDots,
   Check,
   Flag,
   Info,
   PencilSimple,
   Trash,
   X
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRef, useState } from 'react';
// AddCommentSection: input and button to add a comment (observation)
function AddCommentSection({ taskId, onAdd }: { taskId: number, onAdd: (content: string) => Promise<void> }) {
   const [comment, setComment] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [commented, setCommented] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);

   const handleAddComment = async () => {
      if (!comment.trim()) return;
      setLoading(true);
      setError(null);
      try {
         await onAdd(comment);
         setComment('');
         setCommented(true);
         if (inputRef.current) inputRef.current.blur();
      } catch (e) {
         setError('Erro ao adicionar comentário');
      } finally {
         setLoading(false);
      }
   };

   if (commented) {
      return <div className="text-xs text-green-600 mt-2">Comentário adicionado!</div>;
   }

   return (
      <div className="mt-3">
         <div className="flex gap-2">
            <input
               ref={inputRef}
               type="text"
               className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
               placeholder="Adicionar comentário..."
               value={comment}
               onChange={e => setComment(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
               disabled={loading}
            />
            <Button size="sm" color="primary" isLoading={loading} onClick={handleAddComment} disabled={!comment.trim()}>
               Comentar
            </Button>
         </div>
         {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
   );
}

// Helper function to get user initials
const getUserInitials = (username: string): string => {
   return username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
};

// Helper function to parse observations string into array
const getObservations = (obs?: string) => {
   if (!obs) return [];
   return obs.split('\n').filter(line => line.trim()).map((content, index) => ({ id: index + 1, content: content.trim() }));
};

interface TaskCardProps {
   task: Task;
   onEdit: (task: Task) => void;
   onDelete: (taskId: number) => void;
   onStatusChange: (taskId: number, status: TaskStatus) => void;
   onAddObservation?: (taskId: number, content: string) => Promise<void>;
   isDragging?: boolean;
}

const priorityConfig = {
   [TaskPriority.LOW]: {
      label: 'Baixa',
      color: 'success',
      icon: <Flag />,
      cardClass: 'border-l-green-400',
   },
   [TaskPriority.MEDIUM]: {
      label: 'Média',
      color: 'warning',
      icon: <Flag />,
      cardClass: 'border-l-yellow-400',
   },
   [TaskPriority.HIGH]: {
      label: 'Alta',
      color: 'danger',
      icon: <Flag />,
      cardClass: 'border-l-orange-500',
   },
   [TaskPriority.URGENT]: {
      label: 'Urgente',
      color: 'danger',
      icon: <Flag weight="fill" />,
      cardClass: 'border-l-red-600',
   },
} as const;

export default function TaskCard({
   task,
   onEdit,
   onDelete,
   onStatusChange,
   onAddObservation,
   isDragging: isOverlayDragging,
}: TaskCardProps) {
   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: task.id });

   const [isMouseDown, setIsMouseDown] = useState(false);
   const { isOpen, onOpen, onClose } = useDisclosure();
   const [infoOpen, setInfoOpen] = useState(false);

   const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition || 'transform 250ms ease', // Ensure transition is always applied
   };

   const handleMouseDown = () => {
      setIsMouseDown(true);
   };

   const handleMouseUp = () => {
      setIsMouseDown(false);
   };

   const handleMouseLeave = () => {
      setIsMouseDown(false);
   };

   const handleQuickComplete = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onStatusChange(task.id, TaskStatus.DONE);
   };

   const handleQuickCancel = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onStatusChange(task.id, TaskStatus.CANCELLED);
   };

   const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onOpen();
   };

   const handleConfirmDelete = () => {
      onDelete(task.id);
      onClose();
   };

   const formatDate = (dateString?: string) => {
      if (!dateString) return null;
      try {
         // Assume dateString is in YYYY-MM-DD format, treat as UTC to avoid timezone shift
         const date = new Date(dateString + 'T00:00:00.000Z');
         return format(date, 'dd MMM', { locale: ptBR });
      } catch {
         return null;
      }
   };

   const isOverdue =
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== TaskStatus.DONE;
   const dueDateLabel = formatDate(task.dueDate);

   const collaborators = task.taskAccess?.filter(
      (access) => access.accessLevel === 'collaborator',
   );

   return (
      <>
         <Card
            ref={setNodeRef}
            style={style}
            className={`group relative mb-4 rounded-xl border border-gray-100 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${priorityConfig[task.priority].cardClass}
               ${isDragging || isOverlayDragging ? 'opacity-60 rotate-2 shadow-lg cursor-grabbing' : isMouseDown ? 'cursor-grabbing' : 'cursor-grab hover:cursor-grab'}
               ring-1 ring-slate-200/60`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            {...attributes}
            {...listeners}
         >
            <CardBody className="p-2.5 sm:p-3 flex flex-col gap-1.5 min-h-[96px] cursor-inherit">
               <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                     <Tooltip content="Mais informações" placement="top">
                        <Button isIconOnly size="sm" variant="light" className="cursor-pointer" onClick={e => { e.stopPropagation(); setInfoOpen(true); }}>
                           <Info size={18} />
                        </Button>
                     </Tooltip>
                     {/* Edit button always visible */}
                     <Tooltip content="Editar Tarefa" placement="top">
                        <Button isIconOnly size="sm" variant="light" className="cursor-pointer" onClick={e => { e.stopPropagation(); onEdit(task); }}>
                           <PencilSimple size={18} />
                        </Button>
                     </Tooltip>
                  </div>
                  <div className="flex items-center gap-1">
                     {/* CANCELADA: only show delete button */}
                     {task.status === TaskStatus.CANCELLED ? (
                        <Tooltip content="Excluir Tarefa" placement="top">
                           <Button isIconOnly size="sm" variant="solid" color="danger" className="cursor-pointer" onClick={handleDeleteClick}>
                              <Trash size={16} />
                           </Button>
                        </Tooltip>
                     ) : (
                        <>
                           {task.status !== TaskStatus.DONE && (
                              <Tooltip content="Concluir Tarefa" placement="top">
                                 <Button isIconOnly size="sm" variant="solid" color="success" className="cursor-pointer" onClick={handleQuickComplete}>
                                    <Check size={16} />
                                 </Button>
                              </Tooltip>
                           )}
                           <Tooltip content="Cancelar Tarefa" placement="top">
                              <Button isIconOnly size="sm" variant="solid" color="danger" className="cursor-pointer" onClick={handleQuickCancel}>
                                 <X size={16} />
                              </Button>
                           </Tooltip>
                        </>
                     )}
                  </div>
               </div>

               {/* Title */}
               <h3 className="font-semibold text-[14px] leading-tight text-slate-800 mb-0.5 line-clamp-2 cursor-inherit">
                  {task.title}
               </h3>

               {/* Description */}
               {task.description && (
                  <div className="text-xs text-slate-600 mb-0.5 line-clamp-3 cursor-inherit">
                     {task.description}
                  </div>
               )}

               {/* Footer */}
               <div className="flex items-center justify-between mt-0.5">
                  <div className="flex items-center gap-1">
                     {collaborators && collaborators.length > 0 && (
                        <AvatarGroup max={2}>
                           {collaborators.map((c) => (
                              <Tooltip key={c.userId} content={c.user.username} placement="top">
                                 <Avatar name={getUserInitials(c.user.username)} size="sm" classNames={{ base: "bg-gradient-to-br from-pink-400 to-orange-400", name: "text-white font-semibold text-xs" }} />
                              </Tooltip>
                           ))}
                        </AvatarGroup>
                     )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                     <Tooltip content={getObservations(task.observations).length > 0 ? (<div className="p-1 text-xs max-w-xs"><h4 className="font-bold mb-1 text-gray-700">Comentários</h4><ul className="space-y-1">{getObservations(task.observations).map((obs) => (<li key={obs.id} className="text-gray-600 bg-gray-50 p-1 rounded">{obs.content}</li>))}</ul></div>) : ('Nenhum comentário')} placement="top">
                        <div className="flex items-center gap-1 cursor-default">
                           <ChatCircleDots size={16} />
                           <span>{getObservations(task.observations).length}</span>
                        </div>
                     </Tooltip>
                  </div>
               </div>
            </CardBody>
         </Card>

         {/* Info Modal */}
         <Modal isOpen={infoOpen} onClose={() => setInfoOpen(false)} size="sm">
            <ModalContent>
               <ModalHeader className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold">Detalhes da Tarefa</h3>
               </ModalHeader>
               <ModalBody>
                  <div className="flex items-center gap-2 mb-2">
                     <Avatar name={getUserInitials(task.creator.username)} size="md" classNames={{ base: "bg-gradient-to-br from-indigo-400 to-purple-500", name: "text-white font-semibold text-base" }} />
                     <span className="font-medium text-gray-800 text-sm">{task.creator.username}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                     <div><span className="font-medium text-gray-700">Criada em:</span> {formatDate(task.createdAt)}</div>
                     <div><span className="font-medium text-gray-700">Última atualização:</span> {formatDate(task.updatedAt)}</div>
                     <div><span className="font-medium text-gray-700">Prioridade:</span> {priorityConfig[task.priority].label}</div>
                     {task.description && <div><span className="font-medium text-gray-700">Descrição:</span> {task.description}</div>}
                     {getObservations(task.observations).length > 0 && (
                        <div>
                           <span className="font-medium text-gray-700">Observações:</span>
                           <ul className="mt-1 space-y-1">
                              {getObservations(task.observations).map((obs) => (
                                 <li key={obs.id} className="text-gray-600 bg-gray-50 p-1 rounded text-xs">{obs.content}</li>
                              ))}
                           </ul>
                        </div>
                     )}
                  </div>
                  {/* Add comment logic */}
                  <AddCommentSection taskId={task.id} onAdd={(content) => onAddObservation ? onAddObservation(task.id, content) : Promise.resolve()} />
               </ModalBody>
               <ModalFooter>
                  <Button color="default" variant="light" onPress={() => setInfoOpen(false)}>Fechar</Button>
               </ModalFooter>
            </ModalContent>
         </Modal>

         {/* Delete Confirmation Modal */}
         <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalContent>
               <ModalHeader className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold">Confirmar Exclusão</h3>
               </ModalHeader>
               <ModalBody>
                  <p className="text-gray-600">Tem certeza que deseja excluir a tarefa &ldquo;{task.title}&rdquo;?</p>
                  <p className="text-sm text-gray-500 mt-2">Esta ação não pode ser desfeita.</p>
               </ModalBody>
               <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>Cancelar</Button>
                  <Button color="danger" onPress={handleConfirmDelete}>Excluir</Button>
               </ModalFooter>
            </ModalContent>
         </Modal>
      </>
   );
}
