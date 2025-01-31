
import './App.css'
import LogInPage from './pages/LogIn/LogInPage.jsx'
import SignInPage from './pages/SignIn/SignInPage.jsx'
import HomePage from './pages/Main/MainPage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useGlobalContext } from './Contexts/GlobalContext/Context.jsx';

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/signin" element={<SignInPage />} />
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
