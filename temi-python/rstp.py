import cv2

# Replace this with your actual RTSP stream URL
rtsp_url = 'rtsp://10.61.2.17:8080/h264_ulaw.sdp'

# Open the RTSP stream
cap = cv2.VideoCapture(rtsp_url)

if not cap.isOpened():
    print("Error: Could not open RTSP stream.")
    exit()

# Loop to continuously get frames from the stream
while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    # If the frame was not grabbed successfully, break the loop
    if not ret:
        print("Failed to grab frame. Exiting...")
        break

    # Display the frame
    cv2.imshow('RTSP Live Stream', frame)

    # Press 'q' to exit the stream
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the capture object and close windows
cap.release()
cv2.destroyAllWindows()
