import React, { useEffect, useState } from "react";
import axios from 'axios';
import wasd from '../assets/wasd.png';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const Controller = () => {
  const [controlEnabled, setControlEnabled] = useState(false);

  const handleKeyDown = (event) => {
    if (!controlEnabled) return;

    let newCommand;

    switch (event.key.toLowerCase()) {
      case 'w':
        newCommand = 'MOVE_FORWARD';
        break;
      case 's':
        newCommand = 'MOVE_BACKWARD';
        break;
      case 'a':
        newCommand = 'MOVE_LEFT';
        break;
      case 'd':
        newCommand = 'MOVE_RIGHT';
        break;
      case 'x':
      case 'z':
      case 'c':
        newCommand = event.key.toUpperCase(); 
        break;
      default:
        return;
    }

    // Send the newCommand directly, not relying on state
    axios.post('http://localhost:3002/send-command', { command: newCommand })
      .then(response => console.log('Command sent:', response.data))
      .catch(error => console.error('Error sending command:', error));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [controlEnabled]); // Add controlEnabled to dependencies

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 mt-4">
      <div>
        <h1 className="flex justify-center items-center text-4xl">TEMI APP</h1>
        <p className="flex justify-center items-center text-1xl">
          temi-webapp is a web application that allows you to control a temi robot.
        </p>
        <div className="flex items-center justify-center space-x-6">
            <div>
              <h2 className="text-xl">Controller</h2>
              <FormControlLabel
                control={
                  <Switch
                    checked={controlEnabled}
                    onChange={() => setControlEnabled(!controlEnabled)}
                    color="primary"
                    inputProps={{ 'aria-label': 'Enable Control' }}
                  />
                }
                label={controlEnabled ? "Control Enabled" : "Control Disabled"}
              />
              <p className="text-sm text-gray-500 mt-3">Use the WASD keys to control the robot</p>
            </div>
            <div className="ml-8">
              <img src={wasd} alt="WASD" className="w-28 h-auto" />
            </div>
          </div>
        </div>
    </div>
  );
};

export default Controller;