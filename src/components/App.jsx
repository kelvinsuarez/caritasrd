import { Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import Header from './Header.jsx';
import Home from './Home.jsx';
import Services from './Services.jsx';
import Gallery from './Gallery.jsx';
import About from './About.jsx';
import FormReservation from './FormReservation.jsx';
import FormCotization from './FormCotization.jsx';
import Footer from './Footer.jsx';

import '../index.css';

function App() {
  const [reservationOpen, setReservationOpen] = useState(false);
  const [cotizationOpen, setCotizationOpen] = useState(false);
  
  const openReservation = () => {
    setReservationOpen(true);
  };

  const closeReservation = () => {
    setReservationOpen(false);
  }

    const openCotization = () => {
    setCotizationOpen(true);
    };

    const closeCotization = () => {
    setCotizationOpen(false);
    };
  
  return (
    <div className='App'>
      <div className='root'>
        
        <Header
          openReservation = {openReservation}
          openCotization = {openCotization}
        />

        <Routes>
          <Route 
            path='/' 
            element={
              <Home
                openReservation = {openReservation}
                openCotization = {openCotization}
              />
            }
          />  
            
          <Route
            path="/services"
            element={
              <Services openCotization={openCotization} />
            }
          />
          <Route
            path="/gallery"
            element={<Gallery />}
          />
          <Route
            path="/info"
            element={<About />}
          />
        </Routes>  
        <Footer/>
          {reservationOpen && (
          <FormReservation
            closeReservation={closeReservation}
          />
        )}
        {cotizationOpen && (
            <FormCotization
              closeCotization={closeCotization}
            />
        )}
      </div>
    </div>
  );
}

export default App
