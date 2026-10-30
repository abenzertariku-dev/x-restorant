import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

const resolveSocketUrl = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl?.startsWith('http')) {
    return apiUrl.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5000';
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const joinRoom = (room: string) => {
  const instance = getSocket();
  const send = () => instance.emit('join:room', room);
  if (instance.connected) send();
  else instance.once('connect', send);
  return () => instance.emit('leave:room', room);
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
