
import './App.css'
import LogInPage from './pages/LogIn/LogInPage.jsx'
import SignInPage from './pages/SignIn/SignInPage.jsx'
// import HomePage from './pages/Main/HomePage.jsx'
import UserPage from './pages/MainUser/UserPage.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GlobalContext } from './Contexts/GlobalContext/Context.jsx'

import { useGlobalContext } from './Contexts/GlobalContext/Context.jsx';

function App() {


  return (
    <>
      <GlobalContext>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/:username" element={<UserPage />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/signin" element={<SignInPage />} />
          </Routes>
        </BrowserRouter>

      </GlobalContext>

    </>
  )
}

export default App
