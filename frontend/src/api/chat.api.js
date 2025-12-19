import axios from "./axios";

export const fetchThreads = () => {
  return axios.get("/chat/threads/");
};