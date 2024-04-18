import { BrowserRouter } from 'react-router-dom';
import { AuthWrapper } from './auth/authWrapper';
import './app.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthWrapper />
      </BrowserRouter>      
    </div>
  );
}

export default App;
