import React from 'react'
import './App.css'
import Dexie from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

const db = new Dexie('todoApp')
db.version(1).stores({todo: '++id,task,completed,date'})

const {todo} = db

const App = () => {
  const allItems = useLiveQuery(() => todo.toArray(), [])

  todo.where('completed').equals(true).toArray()

  const addTask = async (event) => {
    event.preventDefault()
    const taskField = document.querySelector("#taskInput")


    await todo.add({
      task: taskField['value'],
      completed: false
    })

    taskField['value'] = ''
  }

  const deleteTask = async(id) => todo.delete(id)

  const toggleStatus = async(id, event) => {
    await todo.update(id, {completed: !event.target.checked})
  }

  return (
    <div className="container">
      <h3 className="teal-text center -align">Todo App</h3>
      <form className="add-item-form" onSubmit={addTask}>
        <input
          type="text"
          id="taskInput"
          className="itemField"
          placeholder="What do you want to do today?"
          required
        />
        <button type="submit" className="waves-effect btn teal right">
          Add
        </button>
      </form>

      <div className="card white darken-1">
        <div className="card-content">
          {allItems?.map(({id, completed, task}) => (
            <div className="row" key={id}>
              <p className="col s10">
                <label>
                  <input 
                  type="checkbox"
                  checked={completed}
                  className="checkbox-blue" 
                  onChange={(event) => toggleStatus(id, event)}
                  />
                   <span className={`black - tex ${completed && 'strike-text'}`}>{task}</span>
                </label>
              </p>
              <i onClick={() => deleteTask(id)} className="col s2 material-icons delete-button">delete</i>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
