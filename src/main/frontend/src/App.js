import logo from './logo.svg';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home3</h1>} />
        <Route path="/site" element={<h1>site</h1>} />
        <Route path="/other" element={<h1>other</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
