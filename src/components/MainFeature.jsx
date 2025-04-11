import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Clock, AlertTriangle, Trash2, Edit, Calendar, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

const MainFeature = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo'
  });
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'todo'
    });
    setEditingTask(null);
  };

  const handleOpenForm = (task = null) => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo'
      });
      setEditingTask(task);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    const taskData = {
      ...formData,
      dueDate: formData.dueDate || null
    };
    
    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
    } else {
      onAddTask({
        id: Date.now().toString(),
        ...taskData,
        createdAt: new Date().toISOString(),
        completed: formData.status === 'completed'
      });
    }
    
    handleCloseForm();
  };

  const handleStatusChange = (taskId, newStatus) => {
    onUpdateTask(taskId, { 
      status: newStatus,
      completed: newStatus === 'completed',
      completedAt: newStatus === 'completed' ? new Date().toISOString() : null
    });
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'priority') {
      const priorityValues = { low: 1, medium: 2, high: 3 };
      comparison = priorityValues[a.priority] - priorityValues[b.priority];
    } else if (sortBy === 'dueDate') {
      // Handle null dates by placing them at the end
      if (!a.dueDate && !b.dueDate) comparison = 0;
      else if (!a.dueDate) comparison = 1;
      else if (!b.dueDate) comparison = -1;
      else comparison = new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'status') {
      const statusValues = { todo: 1, inProgress: 2, completed: 3 };
      comparison = statusValues[a.status] - statusValues[b.status];
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-accent';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-secondary';
      default: return 'text-surface-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'inProgress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'todo': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-surface-200 text-surface-700 border-surface-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check size={14} />;
      case 'inProgress': return <Clock size={14} />;
      case 'todo': return <AlertTriangle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Tasks</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenForm()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Task
        </motion.button>
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <span className="text-surface-500 dark:text-surface-400">Sort by:</span>
        {[
          { id: 'dueDate', label: 'Due Date' },
          { id: 'priority', label: 'Priority' },
          { id: 'title', label: 'Title' },
          { id: 'status', label: 'Status' }
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => toggleSort(option.id)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
              sortBy === option.id 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {option.label}
            {sortBy === option.id && (
              <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'} />
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`task-item-neu ${task.status === 'completed' ? 'opacity-80' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-surface-500 dark:text-surface-400' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenForm(task)}
                      className="p-1.5 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
                    >
                      <Edit size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-accent/20 dark:hover:bg-accent/20 hover:text-accent transition-colors"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-surface-600 dark:text-surface-400 text-sm mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    {task.status === 'todo' ? 'To Do' : task.status === 'inProgress' ? 'In Progress' : 'Completed'}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-surface-100 dark:bg-surface-700 ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
                
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400 mb-4">
                    <Calendar size={14} />
                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </div>
                )}
                
                {task.status !== 'completed' && (
                  <div className="flex gap-2 mt-2">
                    {task.status === 'todo' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'inProgress')}
                        className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                      >
                        Start Task
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                    >
                      Mark Complete
                    </button>
                  </div>
                )}
                
                {task.status === 'completed' && (
                  <button
                    onClick={() => handleStatusChange(task.id, 'todo')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
                  >
                    Reopen Task
                  </button>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12 bg-surface-100/50 dark:bg-surface-800/50 rounded-xl border border-dashed border-surface-300 dark:border-surface-700"
            >
              <p className="text-surface-500 dark:text-surface-400 mb-4">No tasks found</p>
              <button
                onClick={() => handleOpenForm()}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Your First Task
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task form modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Task Title <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="What needs to be done?"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="input resize-none"
                    placeholder="Add details about this task..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;