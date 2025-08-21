import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mini Trello</h1>
        <p>Welcome to your task management application!</p>
      </header>
      <main className="App-main">
        <div className="board">
          <div className="column">
            <h2>To Do</h2>
            <div className="card">
              <h3>Sample Task 1</h3>
              <p>This is a sample task in the To Do column.</p>
            </div>
            <div className="card">
              <h3>Sample Task 2</h3>
              <p>Another sample task to get started.</p>
            </div>
          </div>
          <div className="column">
            <h2>In Progress</h2>
            <div className="card">
              <h3>Sample Task 3</h3>
              <p>This task is currently being worked on.</p>
            </div>
          </div>
          <div className="column">
            <h2>Done</h2>
            <div className="card">
              <h3>Completed Task</h3>
              <p>This task has been completed successfully.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
