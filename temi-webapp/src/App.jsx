// App.jsx
import React, { useEffect } from 'react';
import Controller from './components/controller';
import ControllerRes from './components/controller-res';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import { CssBaseline, Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Store from './components/store';
import HomePage from './components/home';

const App = () => {
  const [isSidebar, setIsSidebar] = React.useState(true);
  console.log(isSidebar);
  return (
    <>
      <CssBaseline />
      <div className="app">
        <Sidebar isSidebar={isSidebar} />
        <main className="content">
          <div className="content_body">
            <Box m="20px">
              <Routes>
                <Route path="/" element={<HomePage/> }/>
                <Route path="/prmanagement" element={<Store />} />
              </Routes>
            </Box>
          </div>
        </main>
      </div>
    </>
);
};

export default App;


{/* <div className="flex justify-center items-center">
<div>
    <h1 className="flex justify-center items-center text-4xl">Temi-webapp</h1>
    <p className="flex justify-center items-center text-1xl">
      temi-webapp is a web application that allows you to control a temi robot.
    </p>
    <Controller />
    <ControllerRes />
</div>
</div> */}