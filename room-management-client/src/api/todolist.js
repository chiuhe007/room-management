import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/todolist';

export const getTodos = () =>
    axios.get(BASE_URL, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

export const addTodo = (content) =>
    axios.post(BASE_URL, { content }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

export const updateTodo = (id, data) =>
    axios.put(`${BASE_URL}/${id}`, data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

export const deleteTodo = (id) =>
    axios.delete(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
export const getUserInfo = () =>
    axios.get(`${BASE_URL}/user`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });