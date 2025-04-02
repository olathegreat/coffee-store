import axios from "axios"

export const Axios = axios.create({
    baseURL: process.env.VITE_SERVER_URL,
    withCredentials: true,
})