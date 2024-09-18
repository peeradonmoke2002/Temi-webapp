import React from "react";
import WebRTC from "./webRTC";
import Controller from "./controller"
import Video from './vdo';

function HomePage() {
    return (
        <>
            <div>
                <div className="flex flex-col justify-center items-center w-full py-4">
                    <h1 className="text-4xl font-bold text-gray-800">Control</h1>
                    <h2 className="text-xl text-gray-600 mt-2">Control Your Temi</h2>
                    <hr className="my-4 border-t-2 border-gray-300 w-full" />
                </div>
            </div>
            <Controller />
            <Video websocketUrl="ws://10.7.145.236:8765" />
            {/* <WebRTC /> */}
        </>
    );
    }

export default HomePage;