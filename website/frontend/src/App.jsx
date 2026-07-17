import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import MediaDetail from "./pages/MediaDetail.jsx";
import Account from "./pages/Account.jsx";
import Search from "./pages/Search.jsx";
import Playlists from "./pages/Playlists.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/media/:id" element={<MediaDetail />} />
      <Route path="/account" element={<Account />} />
      <Route path="/search" element={<Search />} />
      <Route path="/playlists" element={<Playlists />} />
      <Route
        path="/movies"
        element={<CategoryPage navKey="movies" title="Movies" />}
      />
      <Route
        path="/shows"
        element={<CategoryPage navKey="shows" title="TV Series" />}
      />
      <Route
        path="/music"
        element={<CategoryPage navKey="music" title="Music" />}
      />
      <Route
        path="/games"
        element={<CategoryPage navKey="games" title="Games" />}
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;