// src/api/room.js
import request from './index';

export function getRooms() {
  return request.get('/rooms');
}

export function createRoom(data) {
  return request.post('/rooms', data);
}

export function updateRoom(id, data) {
  return request.put(`/rooms/${id}`, data);
}

export function deleteRoom(id) {
  return request.delete(`/rooms/${id}`);
}

export const getRoomNumbers = () => request.get('/rooms/numbers'); // ✅ 使用 request
