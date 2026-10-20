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
import RedirectHome from "./routes/RedirectHome"
import VerifyOverlay from "./components/VerifyOverlay"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <div className="flex flex-col min-h-dvh">
                <Header />
                <main className="flex flex-1 flex-col">
                    <VerifyOverlay />
                    <Routes>
                        <Route path="" element={<RedirectHome/>}/>
                        <Route path="login" element={<Login/>}/>
                        <Route path="register" element={<Register/>}/>
                        <Route path="home" element={<Home/>}/>
                        <Route path="*" element={<NotFound />}/>
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
      </QueryClientProvider>
  </StrictMode>
)
