import React, { useState } from 'react';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [data, setData] = useState(null);

  return (
    <div className="App">
      <Dashboard data={data} setData={setData} />
    </div>
  );
}

export default App;
