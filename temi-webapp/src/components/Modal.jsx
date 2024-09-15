import React from "react";



const TailwindModal = ({ show, onClose, imageSrc, title = "Image Preview" }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}  // Calls the onClose (which is closePreview) when clicked
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {/* Modal body */}
          <div className="p-4 space-y-4">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Preview"
                className="w-full h-auto max-w-md max-h-96 object-contain mx-auto"
              />
            ) : (
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                No image available
              </p>
            )}
          </div>

          {/* Modal footer */}
          <div className="flex items-center p-4 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              onClick={onClose}  // Calls the closePreview function on button click
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindModal;