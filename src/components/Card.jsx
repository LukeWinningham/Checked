import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "./Task";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fade from '@mui/material/Fade';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ReplayIcon from '@mui/icons-material/Replay';
import { DeleteButton } from "./Task";
import CloseIcon from '@mui/icons-material/Close';

export const UndoButton = styled(ReplayIcon)`
    color: #f5f6f7;
    cursor: pointer;
    font-size: 16px !important;
    padding-right: 0.5rem;
    &:hover {
        color: rgba(131, 131, 131, 1);
    }
`;
const AddIcon = styled(AddCircleOutlineOutlinedIcon)`
  font-size: 24px !important;
  padding-right: 0.5rem;
  color: inherit;
  -webkit-app-region: no-drag; 
  app-region: no-drag;
  border-radius: 10px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  color: ${({ disabled }) => (disabled ? "#8396a8" : "#f5f6f7")};
  &:hover {
      color: ${({ disabled }) => (disabled ? "transparent" : "#8396a8")};
  }
`;
const CloseButton = styled(CloseIcon)`
  color: #f5f6f7;
  cursor: pointer;
  font-size: 24px !important;
  &:hover {
    color: #8396a8;
  }
`;
const CloseContainer = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #f5f6f7;
  &:hover {
    color: rgba(131, 131, 131, 1);
  }
  -webkit-app-region: no-drag; 
  app-region: no-drag;
`;

const HeaderContainer = styled.div`
  color: white;
  font-size: 24px;
  font-family: "Roboto", sans-serif;
  text-align: center;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 0;
  cursor: pointer;
  -webkit-app-region: no-drag; 
  app-region: no-drag;
`;
const HeaderInput = styled.input`
  color: white;
  font-size: 24px;
  font-family: "Roboto", sans-serif;
  text-align: center;
  letter-spacing: 0.5px;
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
`;

const Inline = styled.div`
  position: relative; 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 1rem;

`;


const CardContainer = styled.div`
  position: relative; 
  width: 325px;
  min-height: 425px;
  height: auto;
  max-height: 80vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  backdrop-filter: blur(50px);
  padding: 1rem;
  -webkit-app-region: drag;
  app-region: drag;
`;


const TaskContainer = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 10px;
  overflow-y: auto;
  box-sizing: border-box;
  margin-top: 0.5rem;
  -webkit-app-region: no-drag; 
  app-region: no-drag;
  scrollbar-color: transparent;
  &::-webkit-scrollbar {
    background: transparent;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: transparent;
  }
`;

const NewTaskInput = styled.input`
  min-width: 270px;
  min-height: 50px;
  max-width: 270px;
  max-height: 50px;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  padding: 0 1rem;
  border: 1px solid #5b738b;
  font-size: 14px;
  font-family: "Roboto", sans-serif;
  outline: none;
  background-color: transparent;
  color: white;
  -webkit-app-region: no-drag; 
  app-region: no-drag;
`;

const CompletedTitle = styled(Typography)`
  color: #5b738b;
  font-size: 14px !important;
  display: flex;
  align-items: center;
`;

const CompletedCountBadge = styled.span`
  background-color: rgba(131, 131, 131, 0.3);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
`;

const StyledAccordion = styled(Accordion)`
  background: transparent !important;
  box-shadow: none !important;
  width: 100%;
  
  &::before {
    display: none !important;
  }
  
  & .MuiAccordionSummary-root {
    min-height: 36px !important;
    padding: 0 !important;
  }
  
  & .MuiAccordionSummary-content {
    margin: 0 !important;
  }
  
  & .MuiAccordionDetails-root {
    padding: 0 !important;
  }
`;

const CompletedTasksContainer = styled.div`
  width: 90%;
  margin-top: 0.5rem;
  opacity: 0.8;
`;

const CompletedTaskItem = styled.div`
  padding: 8px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5b738b;
  text-decoration: line-through;
  font-size: 14px;
`;

const ProgressBarContainer = styled.div`
  width: 85%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto 0.8rem auto;
`;

const ProgressText = styled.div`
  color: #f5f6f7;
  font-size: 12px;
  margin-bottom: 3px;
  align-self: center;
`;

const ProgressBarOuter = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(61, 61, 61, 0.5);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBarInner = styled.div`
  height: 100%;
  background-color: #5b738b;
  border-radius: 2px;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const SparkContainer = styled.div`
  position: absolute;
  right: 7.5%; 
  top: 85px; 
  pointer-events: none;
`;

export const Spark = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #5b738b;
  opacity: 0;
  transform: translate(-50%, -50%);
  animation-name: ${props => `spark-fly-${props.index}`};
  animation-duration: 0.7s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;

  @keyframes spark-fly-0 {
    0% { opacity: 1; transform: translate(0, 0); }
    100% { opacity: 0; transform: translate(-15px, -25px); }
  }
  @keyframes spark-fly-1 {
    0% { opacity: 1; transform: translate(0, 0); }
    100% { opacity: 0; transform: translate(20px, -20px); }
  }
  @keyframes spark-fly-2 {
    0% { opacity: 1; transform: translate(0, 0); }
    100% { opacity: 0; transform: translate(25px, 5px); }
  }
  @keyframes spark-fly-3 {
    0% { opacity: 1; transform: translate(0, 0); }
    100% { opacity: 0; transform: translate(-20px, 15px); }
  }
  @keyframes spark-fly-4 {
    0% { opacity: 1; transform: translate(0, 0); }
    100% { opacity: 0; transform: translate(10px, -30px); }
  }
  @keyframes spark-fly-5 {
    0% { opacity: 1; transform: translate(0, 0); }
    100% { opacity: 0; transform: translate(-25px, -10px); }
  }
`;

const SortableTask = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: "1rem",
    marginLeft: "auto",
    marginRight: "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export const Card = () => {
  const [searchParams] = useSearchParams();
  const initialList = searchParams.get('listData');

  const [tasks, setTasks] = useState([]);
  const [listName, setListName] = useState("Tasks");
  const [editingList, setEditingList] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [completedArchive, setCompletedArchive] = useState([]);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [listId, setListId] = useState(null);
  const [showSparks, setShowSparks] = useState(false);
  const prevProgressRef = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const totalTasks = tasks.length + completedArchive.length;
  const completedTaskCount = completedArchive.length;
  const progressPercentage = totalTasks > 0 
    ? (completedTaskCount / totalTasks) * 100 
    : 0;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setIsAddingTask(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveList();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tasks, listName, listId, completedArchive]);
  
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      await handleSaveList();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tasks, listName, listId, completedArchive]);

  useEffect(() => {
    if (initialList) {
      try {
        const parsedList = JSON.parse(initialList);
        const hasTasks = parsedList.tasks?.length > 0;
        setTasks(parsedList.tasks || []);
        setListName(parsedList.listName || "Tasks");
        setListId(parsedList.id || null);
        setIsAddingTask(hasTasks ? false : true);
      } catch (error) {
        console.error("Error parsing list:", error);
      }
    } else {
      setIsAddingTask(tasks.length === 0);
    }
  }, [initialList]);

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);
    setTasks(arrayMove(tasks, oldIndex, newIndex));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleUpdateTask = (taskId, newTitle) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, name: newTitle } : task)));
  };

  const handleAddNewTask = (closeAfter = true) => {
    if (newTaskTitle.trim() !== "") {
      const newTask = { id: new Date().getTime().toString(), name: newTaskTitle.trim() };
      setTasks([newTask, ...tasks]);
    }
    setNewTaskTitle("");
    if (closeAfter) {
      setIsAddingTask(false);
    }
  };

  const handleNewTaskKeyDown = (e) => {
    if (e.key === "Enter") {
      if (newTaskTitle.trim() !== "") {
        handleAddNewTask(false);
      }
    }
  };

  const handleSaveList = async () => {
    try {
      const currentList = {
        id: listId || uuidv4(),
        tasks: tasks,
        listName: listName,
        completedArchive: completedArchive,
        updatedAt: new Date().toISOString()
      };

      console.log("Calling window.electron.saveLists with:", currentList);

      if (window.electron && window.electron.saveLists) {
        const lists = await window.electron.getLists() || [];
        const existingListIndex = lists.findIndex(list => list.id === currentList.id);

        let updatedLists = [...lists];
        if (existingListIndex > -1) {
          updatedLists[existingListIndex] = currentList;
        } else {
          updatedLists.push(currentList);
        }

        await window.electron.saveLists(updatedLists);
        console.log("window.electron.saveLists returned");
        window.close();
      } else {
        console.error("electron.saveLists is not available");
      }
    } catch (error) {
      console.error("Error saving list:", error);
    }
  };

  const handleListNameChange = (e) => {
    const newName = e.target.value;
    console.log('Changing list name to:', newName);
    setListName(newName);
  };

  const handleListNameBlur = () => {
    console.log('Saving list name:', listName);
    try {
      setEditingList(false);
    } catch (error) {
      console.error('Error saving list name:', error);
    }
  };

  useEffect(() => {
    const cardContainer = document.querySelector('[data-card-container]');
    if (!cardContainer) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        window.electron?.setSize(325, Math.max(425, height + 40));
      }
    });

    resizeObserver.observe(cardContainer);
    return () => resizeObserver.disconnect();
  }, []);

  const handleCompleteTask = (taskId) => {
    const taskToComplete = tasks.find(task => task.id === taskId);
    if (taskToComplete) {
      setTasks(tasks.filter(task => task.id !== taskId));
      
      setCompletedArchive([
        { ...taskToComplete, completedAt: new Date().toISOString() },
        ...completedArchive
      ]);
    }
  };
  
  const handleRestoreTask = (taskId) => {
    const taskToRestore = completedArchive.find(task => task.id === taskId);
    if (taskToRestore) {
      const { completedAt, ...restoredTask } = taskToRestore;
      
      setCompletedArchive(completedArchive.filter(task => task.id !== taskId));
      
      setTasks([restoredTask, ...tasks]);
    }
  };
  
  const handleDeleteCompletedTask = (taskId) => {
    setCompletedArchive(completedArchive.filter(task => task.id !== taskId));
  };

  useEffect(() => {
    if (progressPercentage === 100 && prevProgressRef.current < 100 && totalTasks > 0) {
      setShowSparks(true);
      
      const timer = setTimeout(() => {
        setShowSparks(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    prevProgressRef.current = progressPercentage;
  }, [progressPercentage, totalTasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContainer data-card-container>
        <Inline>
          <CloseContainer 
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              bottom: 'auto'
            }}
          >
            <CloseButton onClick={handleSaveList} />
          </CloseContainer>
          {editingList ? (
            <HeaderInput
              autoFocus
              value={listName}
              onChange={handleListNameChange}
              onBlur={handleListNameBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleListNameBlur();
                if (e.key === "Escape") setEditingList(false);
              }}
              style={{ margin: '0 60px' }}
            />
          ) : (
            <HeaderContainer 
              onClick={() => setEditingList(true)}
              style={{ margin: '0 60px' }}
            >
              {listName}
            </HeaderContainer>
          )}
          <AddIcon
            disabled={isAddingTask} 
            onClick={() => !isAddingTask && setIsAddingTask(true)}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              bottom: 'auto',
              width: 'auto'
            }}
          >
          </AddIcon>
        </Inline>
        
        <ProgressBarContainer>
          <ProgressText>
            {completedTaskCount}/{totalTasks} tasks completed
          </ProgressText>
          <ProgressBarOuter>
            <ProgressBarInner progress={progressPercentage} />
          </ProgressBarOuter>
          
          {showSparks && (
            <SparkContainer>
              {[...Array(6)].map((_, i) => (
                <Spark key={i} index={i} />
              ))}
            </SparkContainer>
          )}
        </ProgressBarContainer>
        
        <TaskContainer>
          {isAddingTask && (
            <NewTaskInput
              autoFocus
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={handleAddNewTask}
              onKeyDown={handleNewTaskKeyDown}
            />
          )}
          {tasks.length > 0 && (
            <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTask key={task.id} id={task.id}>
                  <Task 
                    task={task} 
                    onDeleteTask={handleDeleteTask} 
                    onUpdateTask={handleUpdateTask}
                    onCompleteTask={handleCompleteTask} 
                  />
                </SortableTask>
              ))}
            </SortableContext>
          )}
          
          {completedArchive.length > 0 && (
            <CompletedTasksContainer>
              <StyledAccordion
                expanded={isCompletedExpanded}
                onChange={() => setIsCompletedExpanded(!isCompletedExpanded)}
                slots={{ transition: Fade }}
                slotProps={{ transition: { timeout: 300 } }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#f5f6f7' }} />}
                  aria-controls="completed-tasks-content"
                  id="completed-tasks-header"
                >
                  <CompletedTitle>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, marginRight: 1 }} />
                    Completed
                    <CompletedCountBadge>{completedArchive.length}</CompletedCountBadge>
                  </CompletedTitle>
                </AccordionSummary>
                <AccordionDetails>
                  {completedArchive.map((task) => (
                    <CompletedTaskItem key={task.id}>
                      <span>{task.name}</span>
                      <div>
                        <UndoButton 
                          onClick={() => handleRestoreTask(task.id)}
                        />
                        <DeleteButton 
                          onClick={() => handleDeleteCompletedTask(task.id)}
                        />
                      </div>
                    </CompletedTaskItem>
                  ))}
                </AccordionDetails>
              </StyledAccordion>
            </CompletedTasksContainer>
          )}
        </TaskContainer>
        
      </CardContainer>
      <DragOverlay>
        {activeId && (
          <div style={{ width: "100%" }}>
            <Task task={tasks.find((task) => task.id === activeId)} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};