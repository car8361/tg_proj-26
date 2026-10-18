import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router"
import './index.css'
import Login from './routes/Login'
import Register from './routes/Register'
import NotFound from './routes/NotFound'
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./routes/Home"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <div className="flex flex-col min-h-dvh">
            <Header />
            <main className="flex flex-1 flex-col">
                <Routes>
                    <Route path="login" element={<Login/>}/>
                    <Route path="register" element={<Register/>}/>
                    <Route path="home" element={<Home/>}/>
                    <Route path="*" element={<NotFound />}/>
                </Routes>
            </main>
            <Footer />
        </div>
    </BrowserRouter>
  </StrictMode>,
)
