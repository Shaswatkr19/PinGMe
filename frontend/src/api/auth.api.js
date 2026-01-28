import api from "./axios";

export const loginUser = (data) =>
  api.post("/auth/login/", data);

export const registerUser = (data) =>
  api.post("/auth/register/", data);

export const checkUsernameAvailability = (username) =>
  api.get("/auth/check-username/", { params: { username } });

export const requestPasswordReset = (email) =>
  api.post("/auth/password-reset/request/", { email });

export const confirmPasswordReset = (token, uid, newPassword) =>
  api.post("/auth/password-reset/confirm/", { token, uid, new_password: newPassword });

export const getCurrentUser = () =>
  api.get("/auth/me/");

export const searchUsers = (query) =>
  api.get("/auth/search/", { params: { q: query } });

export const followUser = (username) =>
  api.post(`/auth/follow/${username}/`);

export const unfollowUser = (username) =>
  api.post(`/auth/unfollow/${username}/`);

export const getFollowers = () =>
  api.get("/auth/me/followers/");

export const getFollowing = () =>
  api.get("/auth/me/following/");

export const getBlockedUsers = () =>
  api.get("/auth/me/blocked/");

export const blockUser = (username) =>
  api.post(`/auth/block/${username}/`);

export const unblockUser = (username) =>
  api.post(`/auth/unblock/${username}/`);

export const updateProfile = (formData) => {
  // formData is already a FormData object from Settings.jsx
  return api.patch("/auth/update/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};