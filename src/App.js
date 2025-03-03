import React, { useState, useEffect } from 'react';
import './App.css';
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import 'react-circular-progressbar/dist/styles.css';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

const db = new Dexie('todoApp');
db.version(1).stores({
  todoList: '++id,name',
  todo: '++id,task,completed,listId,date'
});
const { todoList, todo } = db;

const App = () => {
  const allLists = useLiveQuery(() => todoList.toArray(), []);
  const allItems = useLiveQuery(() => todo.toArray(), []);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    if (allLists?.length > 0 && !selectedList) {
      setSelectedList(allLists[0].id);
    }
  }, [allLists]);

  const addTask = async (event) => {
    event.preventDefault();
    const taskField = document.querySelector('#taskInput');
    if (taskField.value.trim() === '' || !selectedList) return;
    const id = await todo.add({
      task: taskField.value,
      completed: false,
      listId: selectedList
    });
    window.alert(`ToDo '${taskField.value}' successfully added. Got id ${id}`);
    taskField.value = '';
  };

  const addList = async () => {
    const name = prompt('Enter the name of the new To-Do list:');
    if (name) {
      const id = await todoList.add({ name });
      setSelectedList(id);
    }
  };

  const deleteList = async (id) => {
    if (allLists.length === 1) return;
    if (window.confirm('Are you sure you want to delete this list?')) {
      await todoList.delete(id);
      await todo.where('listId').equals(id).delete();
      setSelectedList(allLists[0]?.id || null);
    }
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

  return (
    <div className="task-tracker-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <button onClick={addList} className="waves-effect btn teal">Add Another List</button>
      {allLists?.map(({ id, name }) => {
        const tasks = allItems?.filter(item => item.listId === id) || [];
        const completedTasks = tasks.filter(task => task.completed).length;
        const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
        
        return (
          <div key={id} className="todo-list" style={{ textAlign: 'center' }}>
            <h3 onClick={() => setSelectedList(id)} style={{ cursor: 'pointer' }}>{name}</h3>
            {allLists.length > 1 && <i onClick={() => deleteList(id)} className="material-icons delete-button">delete</i>}
            <div style={{ width: 100, height: 100, margin: '10px auto' }}>
              <CircularProgressbar
                value={progress}
                text={`${completedTasks}/${tasks.length}`}
                styles={buildStyles({
                  pathColor: 'cyan',
                  trailColor: 'lightgray',
                  textColor: 'black'
                })}
              />
            </div>
            {selectedList === id && (
              <>
                <form className="add-item-form" onSubmit={addTask}>
                  <input type="text" id="taskInput" placeholder="Add todo item..." required />
                  <button type="submit" className="waves-effect btn teal">Add</button>
                </form>
                <div className="card-content">
                  {tasks.map(({ id, completed, task }) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label>
                        <input type="checkbox" checked={completed} onChange={(event) => toggleStatus(id, event)} />
                        <span className={`black-text ${completed && 'strike-text'}`}>{task}</span>
                      </label>
                      <i onClick={() => deleteTask(id)} className="material-icons delete-button">delete</i>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default App;