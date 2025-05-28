import './styles/App.css';
import HomePage from "./pages/HomePage";
import TitleBar from "./components/TitleBar";

function App() {
  return (
    <div className="app">
      <TitleBar />
      <div className="content-area">
        <HomePage />
      </div>
    </div>
  );
}

export default App;
