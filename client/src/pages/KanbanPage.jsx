import { useEffect, useState } from 'react';
import { closestCorners, DndContext, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, CheckCircle2, Clock3, MessageSquareText, Plus, X } from 'lucide-react';
import api from '../api/client';

const lanes = [
  { key: 'TODO', label: 'Todo' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'DONE', label: 'Done' }
];

const priorityStyles = {
  LOW: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
  HIGH: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
  URGENT: 'bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-500/20'
};

function SortableTaskCard({ task, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(task)}
      className={`w-full rounded-2xl border border-[#283140] bg-[#111827] p-4 text-left shadow-[0_12px_30px_rgba(2,6,23,0.2)] transition hover:border-indigo-500/50 hover:bg-[#121c2b] ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityStyles[task.priority] || priorityStyles.MEDIUM}`}>
              {task.priority || 'Medium'}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-50">{task.title}</h3>
        </div>
        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-400" />
      </div>

      <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-400">{task.description || 'No description available.'}</p>

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={12} />
          {task.dueDate || 'No due date'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageSquareText size={12} />
          {task.comments?.length || 0}
        </span>
      </div>
    </button>
  );
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/tasks?projectId=project_1');
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.error('Failed to load tasks', error);
      }
    }

    load();
  }, []);

  const findLaneForTask = (taskId) => {
    const task = tasks.find((entry) => entry.id === taskId);
    return task?.status || null;
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const activeLane = findLaneForTask(active.id);
    const overLane = findLaneForTask(over.id) || over.data?.current?.sortable?.containerId;

    if (!activeLane) return;

    setTasks((previousTasks) => {
      const activeIndex = previousTasks.findIndex((task) => task.id === active.id);
      const overIndex = previousTasks.findIndex((task) => task.id === over.id);

      if (activeIndex === -1) return previousTasks;

      const updated = [...previousTasks];
      const moved = { ...updated[activeIndex], status: overLane || activeLane };
      updated.splice(activeIndex, 1);
      if (overIndex >= 0) {
        updated.splice(overIndex, 0, moved);
      } else {
        updated.push(moved);
      }

      const sourceIndex = updated.findIndex((task) => task.id === active.id);
      if (sourceIndex !== -1) {
        updated[sourceIndex].status = overLane || activeLane;
      }

      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">Kanban board</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Client portal sprint</h1>
        </div>

        <button type="button" className="primary-btn self-start">
          <Plus size={15} />
          New task
        </button>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-5 xl:grid-cols-4">
          {lanes.map((lane) => {
            const laneTasks = tasks.filter((task) => task.status === lane.key);
            return <Lane key={lane.key} lane={lane} tasks={laneTasks} onSelect={setSelectedTask} />;
          })}
        </div>
      </DndContext>

      {selectedTask && (
        <div className="drawer-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="drawer-panel p-5 md:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-[#283140] pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Task detail</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{selectedTask.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedTask(null)} className="rounded-lg border border-[#283140] bg-[#111827] p-2 text-slate-300 hover:border-slate-500">
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-5 overflow-y-auto pr-1">
              <div className="rounded-2xl border border-[#283140] bg-[#111827] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityStyles[selectedTask.priority] || priorityStyles.MEDIUM}`}>
                    {selectedTask.priority || 'Medium'}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#283140] bg-[#0d1117] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-300">
                    {selectedTask.status || 'TODO'}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{selectedTask.description || 'No description available for this task yet.'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#283140] bg-[#0d1117] p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Assignee</div>
                  <div className="mt-2 text-sm font-medium text-white">{selectedTask.assigneeId || 'Unassigned'}</div>
                </div>
                <div className="rounded-2xl border border-[#283140] bg-[#0d1117] p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Due date</div>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
                    <CalendarDays size={14} className="text-indigo-300" />
                    {selectedTask.dueDate || 'No due date'}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#283140] bg-[#111827] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Checklist</h3>
                  <button type="button" className="text-xs font-medium text-indigo-300">Add item</button>
                </div>
                <div className="space-y-2">
                  {selectedTask.subtasks?.length ? (
                    selectedTask.subtasks.map((item) => (
                      <div key={item.id || item.title} className="flex items-center gap-2 rounded-xl border border-[#283140] bg-[#0d1117] px-3 py-2 text-sm text-slate-300">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        {item.title || item}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#283140] bg-[#0d1117] px-3 py-4 text-sm text-slate-400">No subtasks yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Lane({ lane, tasks, onSelect }) {
  const { setNodeRef } = useDroppable({ id: lane.key });

  return (
    <div ref={setNodeRef} className="surface-soft min-h-[470px] rounded-[24px] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{lane.label}</h2>
        </div>
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-[#283140] bg-[#0d1117] px-2 text-xs font-semibold text-slate-300">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onSelect={onSelect} />
          ))}

          {!tasks.length && (
            <div className="rounded-2xl border border-dashed border-[#283140] bg-[#0d1117] p-4 text-center text-sm text-slate-400">
              No tasks in this stage.
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
