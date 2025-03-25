import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

export const DeleteButton = styled(DeleteIcon)`
    color: #f5f6f7;
    cursor: pointer;
    font-size: 16px !important;
    &:hover {
        color: #8396a8;
    }
`;
const CopyIcon = styled(ContentCopyIcon)`
    color: #f5f6f7;
    cursor: pointer;
    font-size: 16px !important;
    &:hover {
        color: #8396a8;
    }
`;
const CircleIcon = styled(CircleOutlinedIcon)`
    color: #f5f6f7;
    cursor: pointer;
    font-size: 16px !important;
    transition: opacity 0.3s ease-in-out;
    opacity: ${props => (props.isHovered ? '1' : '0')};
    &:hover {
        color: #8396a8;
    }
`;

const checkAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.5);
  }
`;

const AnimatedCheckIcon = styled(CheckCircleOutlineOutlinedIcon)`
    color: #188918;
    cursor: pointer;
    font-size: 16px !important;
    animation: ${checkAnimation} 1s ease-in-out;
`;

const TaskCard = styled.div`
    width: 300px;
    min-height: 50px;
    height: auto;
    margin-bottom: 0.5rem;
    border-radius: 10px;
    display: flex;
    align-items: flex-start;
    background-color: #242E38;
    cursor: pointer;
    border: 1px solid #242E38;
    &:hover {
        background-color: #2F3C48;
    }
`;

const Inline = styled.div`
    display: flex;
    align-items: flex-start;
    width: 100%;
    padding: 1rem;
`;

const StartContainer = styled.div`
    display: flex;
    align-items: flex-start;
    transition: margin-right 0.3s ease-in-out;
    margin-right: ${props => (props.isHovered || props.completed ? '0' : '-2rem')};
    overflow: hidden;
    
    svg {
        margin-top: 2px;
    }
`;

const TaskName = styled.div`
    color: white;
    font-size: 14px;
    font-family: 'Roboto', sans-serif;
    margin-left: 1rem;
    flex: 1;
    transition: margin-left 0.3s ease-in-out;
    margin-left: ${props => (props.isHovered || props.completed ? '1rem' : '0')};
    max-width: 210px;
    word-wrap: break-word;
    word-break: break-word;
    
    p {
        margin: 0;
        overflow-wrap: break-word;
        white-space: normal;
    }
    
    input {
        width: 100%;
        max-width: 100%;
        font-size: 14px;
        font-family: 'Roboto', sans-serif;
        border: none;
        outline: none;
        background: transparent;
        color: white;
    }
`;

export const TaskOptions = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    margin-top: 2px;
`;

const TaskCardContainer = styled.div`
  &:hover ${TaskOptions} {
    opacity: 1;
  }
`;

export const Task = ({ task, onDeleteTask, onUpdateTask, onCompleteTask }) => {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(task.name);
    const [completed, setCompleted] = React.useState(false);
    const [isHovered, setIsHovered] = useState(false);

  const handleBlur = () => {
    if (title.trim() !== "") {
      onUpdateTask(task.id, title);
    } else {
      setTitle(task.name);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(task.name)
      .then(() => {
        console.log("Task name copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy task name: ", err);
      });
  };

    const handleComplete = () => {
        setCompleted(true);
        setTimeout(() => {
            onCompleteTask(task.id);
            setCompleted(false);
        }, 300);
    };

  return (
    <TaskCardContainer
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <TaskCard>
        <Inline>
          <StartContainer isHovered={isHovered} completed={completed}>
              {completed ? (
                  <AnimatedCheckIcon />
              ) : (
                  <CircleIcon isHovered={isHovered} onClick={handleComplete} />
              )}
            <TaskName isHovered={isHovered} completed={completed} onClick={() => setEditing(true)}>
              {editing ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <p>{title}</p>
              )}
            </TaskName>
          </StartContainer>
          {isHovered && (
            <TaskOptions>
              <CopyIcon onClick={handleCopy} />
              <DeleteButton onClick={() => onDeleteTask(task.id)} />
            </TaskOptions>
          )}
        </Inline>
      </TaskCard>
    </TaskCardContainer>
  );
};