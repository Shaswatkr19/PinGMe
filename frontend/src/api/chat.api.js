import api from "./axios";

export const fetchThreads = () => {
  return api.get("/chat/");
};

export const createThread = (username) => {
  return api.post("/chat/create/", { username });
};