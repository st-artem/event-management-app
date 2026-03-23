import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; 
import Footer from './Footer'; 
import { AiAssistant } from './AiAssistant'; 


export default function Layout() {
  return (
    <>
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        <Outlet /> 
      </main>
      
      <Footer />

      <AiAssistant />
    </>
  );
}