import './styles/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import DeskPage from "./pages/DeskPage";
import TitleBar from "./components/TitleBar";

function App() {
  return (
    <div className="app">
      <TitleBar />
      <div className="content-area">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/desk" element={<DeskPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
