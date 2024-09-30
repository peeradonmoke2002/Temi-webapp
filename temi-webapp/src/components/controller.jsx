import React, { useEffect, useState } from "react";
import axios from 'axios';
import wasd from '../assets/wasd.png';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import config from "../config/configureAPI";
const currentUrl = window.location.href;
const isDeploy = currentUrl.includes('localhost') ? 'development' : 'production';  
const environment = process.env.NODE_ENV || isDeploy;
const API = config[environment].API;


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
    axios.post(`${API}/send-command`, { command: newCommand })
      .then(response => console.log('Command sent:', response.data))
      .catch(error => console.error('Error sending command:', error));
  };

  const handelButtonHeadRobotUp = () => {
    axios.post(`${API}/send-command-head`, { command: 'HEAD_UP' })
      .then(response => console.log('Command sent:', response.data))
      .catch(error => console.error('Error sending command:', error));
  }

  const handelButtonHeadRobotDown = () => {
    axios.post(`${API}/send-command-head`, { command: 'HEAD_DOWN' })
      .then(response => console.log('Command sent:', response.data))
      .catch(error => console.error('Error sending command:', error));
  }


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [controlEnabled]); // Add controlEnabled to dependencies

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 mt-1">
      <div>
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
            <div className="flex flex-col space-y-2 mt-4">
              <button onClick={handelButtonHeadRobotUp} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Head Up</button>
              <button onClick={handelButtonHeadRobotDown} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Head Down</button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Controller;
