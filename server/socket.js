let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  return ioInstance;
};

export const emitEvent = (eventName, data) => {
  if (ioInstance) {
    ioInstance.emit(eventName, data);
  }
};
