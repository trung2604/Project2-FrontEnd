import { useState } from 'react';
import './body.css';

const Body = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="home-container">
      <h1>Welcome to Our App</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
        <p>
          This is a demo counter to show React state management
        </p>
      </div>
      <p className="read-the-docs">
        Explore our app using the navigation menu above
      </p>
    </div>
  );
};

export default Body;
