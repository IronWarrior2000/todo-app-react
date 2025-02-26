import React, { useState, useEffect } from 'react';
import './App.css';
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const db = new Dexie('todoApp');
db.version(1).stores({ todo: '++id,task,completed,date' });
const { todo } = db;

const App = () => {
  const allItems = useLiveQuery(() => todo.toArray(), []);
  const [completedTasks, setCompletedTasks] = useState(0);
  
  useEffect(() => {
    if (allItems) {
      const completedCount = allItems.filter(item => item.completed).length;
      setCompletedTasks(completedCount);
    }
  }, [allItems]);

  const addTask = async (event) => {
    event.preventDefault();
    const taskField = document.querySelector('#taskInput');
    if (taskField.value.trim() === '') return;
    const id = await todo.add({
      task: taskField.value,
      completed: false,
    });
    window.alert(`ToDo '${taskField.value}' successfully added. Got id ${id}`);
    taskField.value = '';
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await todo.delete(id);
    }
  };

  const toggleStatus = async (id, event) => {
    if (window.confirm('Are you sure you want to mark this task as completed?')) {
      await todo.update(id, { completed: !!event.target.checked });
      if (event.target.checked) {
        window.alert('Task marked as completed!');
      }
    }
  };

  const totalTasks = allItems?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="task-tracker-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="task-tracker" style={{ textAlign: 'center' }}>
        <h3>Task Tracker</h3>
        <p>Way to go!</p>
        <div className="circle-progress" style={{ width: '100px', height: '100px', margin: '0 auto' }}>
          <CircularProgressbar
            value={progress}
            text={`${completedTasks}/${totalTasks}`}
            styles={buildStyles({
              textColor: '#000',
              pathColor: 'blue',
              trailColor: 'lightgray',
            })}
          />
        </div>
      </div>
      
      <form className="add-item-form" onSubmit={addTask} style={{ textAlign: 'center', marginTop: '20px' }}>
        <input
          type="text"
          id="taskInput"
          className="itemField"
          placeholder="What do you want to do today?"
          required
        />
        <button type="submit" className="waves-effect btn teal right" style={{ display: 'block', margin: '10px auto' }}>
          Add
        </button>
      </form>
      
      <div className="card white darken-1" style={{ width: '80%', maxWidth: '400px', marginTop: '20px' }}>
        <div className="card-content">
          {allItems?.map(({ id, completed, task }) => (
            <div className="row" key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p className="col s10">
                <label>
                  <input
                    type="checkbox"
                    checked={completed}
                    className="checkbox-blue"
                    onChange={(event) => toggleStatus(id, event)}
                  />
                  <span className={`black-text ${completed && 'strike-text'}`} style={{ marginLeft: '10px' }}>{task}</span>
                </label>
              </p>
              <i
                onClick={() => deleteTask(id)}
                className="col s2 material-icons delete-button"
                style={{ cursor: 'pointer' }}
              >delete</i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
