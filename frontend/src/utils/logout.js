export default function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  window.location.href = "/login";
}
