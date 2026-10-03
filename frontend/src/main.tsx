import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router"
import './index.css'
import Login from './routes/Login'
import Register from './routes/Register'
import NotFound from './routes/NotFound'
import { UserProvider } from "./UserContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <UserProvider>
            <Routes>
                <Route path="login" element={<Login/>}/>
                <Route path="register" element={<Register/>}/>
                <Route path="*" element={<NotFound />}/>
            </Routes>
        </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
