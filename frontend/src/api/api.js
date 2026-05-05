import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API = axios.create({ baseURL });

export const generateSchedule = (data) => API.post(`/api/v1/timetable/schedule`, data);

export const getUniversities = () => API.get(`/api/v1/university/getUni`);
export const getPrograms = () => API.get(`/api/v1/programs/getProgram`);
export const getStreams = () => API.get(`/api/v1/streams/getstreams`);
export const getSubjects = () => API.get(`/api/v1/subjects/getSubjects`);
export const getRecentActivity = () => API.get(`/api/v1/activity/recent`);