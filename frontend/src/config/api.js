const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_URL || "http://localhost:5000"
);

export const apiUrl = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const assetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return apiUrl(path);
};
