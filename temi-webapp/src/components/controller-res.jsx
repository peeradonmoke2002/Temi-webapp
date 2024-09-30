import React, { useEffect, useState } from "react";
import axios from 'axios';

import config from "../config/configureAPI";
const currentUrl = window.location.href;
const isDeploy = currentUrl.includes('localhost') ? 'development' : 'production';  
const environment = process.env.NODE_ENV || isDeploy;
const API = config[environment].API;

const ControllerRes = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get(`${API}/get-message`);
        setMessage(response.data);
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };

    // Fetch message initially
    fetchMessage();

    // Set up interval to fetch message every 5 seconds
    const intervalId = setInterval(fetchMessage, 500);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const clearMessage = () => {
    setMessage('');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 mt-4">
      <div className="flex items-center justify-center space-x-6">
        <div>
          <h2 className="text-xl">Controller-Receive data</h2>
          <div className="mt-4 flex items-center space-x-4">
            <p>Current Message: {message}</p>
            <button 
              onClick={clearMessage} 
              className="px-1.5 py-1 bg-red-500 text-white rounded"
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerRes;