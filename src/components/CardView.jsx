import React, { useState, useEffect, useRef } from 'react';
import { Container, AddTaskContainer, AddTaskButton } from './components';

function CardView({ list = {}, onSave }) {
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const newTaskInputRef = useRef(null);
  const addTaskContainerRef = useRef(null);
  const preventFirstClickRef = useRef(false);

  useEffect(() => {
    function handleAppClick(event) {
      if (!addingTask) return;
      
      if (preventFirstClickRef.current) {
        preventFirstClickRef.current = false;
        return;
      }
      
      if (newTaskInputRef.current && newTaskInputRef.current.contains(event.target)) {
        return;
      }
      
      setAddingTask(false);
      setNewTaskText('');
    }
    
    document.addEventListener('mousedown', handleAppClick);
    
    return () => {
      document.removeEventListener('mousedown', handleAppClick);
    };
  }, [addingTask]);

  const handleAddTaskClick = () => {
    setAddingTask(true);
    preventFirstClickRef.current = true; 
    
    setTimeout(() => {
      if (newTaskInputRef.current) {
        newTaskInputRef.current.focus();
      }
    }, 0);
  };

  return (
    <Container>
      
      {addingTask ? (
        <AddTaskContainer ref={addTaskContainerRef}>
          <input
            ref={newTaskInputRef}
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTaskText.trim()) {
                setAddingTask(false);
                setNewTaskText('');
              } else if (e.key === 'Escape') {
                setAddingTask(false);
                setNewTaskText('');
              }
            }}
          />
        </AddTaskContainer>
      ) : (
        <AddTaskButton onClick={handleAddTaskClick}>
          + Add a task
        </AddTaskButton>
      )}
      
      {/* Other components and code */}
    </Container>
  );
}

export default CardView;
