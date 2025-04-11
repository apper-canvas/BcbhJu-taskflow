import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainFeature from '../components/MainFeature';

const Home = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [activeFilter, setActiveFilter] = useState('all');
  
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };
  
  const updateTask = (id, updatedTask) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updatedTask } : task));
  };
  
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const filteredTasks = () => {
    switch (activeFilter) {
      case 'todo':
        return tasks.filter(task => task.status === 'todo');
      case 'inProgress':
        return tasks.filter(task => task.status === 'inProgress');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };
  
  const filterButtons = [
    { id: 'all', label: 'All Tasks' },
    { id: 'todo', label: 'To Do' },
    { id: 'inProgress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' }
  ];
  
  // Calculate task statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter(task => task.status === 'todo').length,
    inProgress: tasks.filter(task => task.status === 'inProgress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
  };
  
  return (
    <div className="space-y-8">
      <section className="text-center max-w-3xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
        >
          Organize Your Tasks with Ease
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-surface-600 dark:text-surface-300 text-lg"
        >
          Create, organize, and track your tasks in one beautiful interface
        </motion.p>
      </section>
      
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'bg-primary' },
          { label: 'To Do', value: stats.todo, color: 'bg-accent' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-secondary' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="card p-4 flex flex-col items-center justify-center"
          >
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-2`}>
              <span className="text-white font-bold text-xl">{stat.value}</span>
            </div>
            <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">{stat.label}</h3>
          </motion.div>
        ))}
      </section>
      
      <section className="flex flex-wrap gap-2 justify-center">
        {filterButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => setActiveFilter(button.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeFilter === button.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {button.label}
          </button>
        ))}
      </section>
      
      <MainFeature 
        tasks={filteredTasks()} 
        onAddTask={addTask} 
        onUpdateTask={updateTask} 
        onDeleteTask={deleteTask}
      />
    </div>
  );
};

export default Home;