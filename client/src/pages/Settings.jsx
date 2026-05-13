import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    display_name: "",
    bio: "",
    avatar: null,
    banner: null,
    instagram_url: "",
    twitter_url: "",
    youtube_url: "",
    soundcloud_url: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access");
   
      const res = await api.get(`profiles/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      
      setProfile({
        display_name: res.data.display_name || "",
        bio: res.data.bio || "",
        avatar: null,
        banner: null,
        instagram_url: res.data.instagram_url || "",
        twitter_url: res.data.twitter_url || "",
        youtube_url: res.data.youtube_url || "",
        soundcloud_url: res.data.soundcloud_url || "",
      });
      if (res.data.avatar) {
        setAvatarPreview(res.data.avatar);
      }
      if (res.data.banner) {
        setBannerPreview(res.data.banner);
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
  };
  fetchProfile();
}, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const field = e.target.name;
      setProfile({ ...profile, [field]: file });
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "avatar") setAvatarPreview(reader.result);
        else if (field === "banner") setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  const formData = new FormData();
  Object.keys(profile).forEach(key => {
    if (profile[key] !== null && profile[key] !== undefined && profile[key] !== "") {
      formData.append(key, profile[key]);
    }
  });

  try {
    const token = localStorage.getItem("access");
    const res = await api.patch(`profiles/me/`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    // guarda el avatar actualizado en localStorage
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({
      ...currentUser,
      avatar: res.data.avatar
    }));

    const currentUser2 = JSON.parse(localStorage.getItem("user") || "{}");
    navigate(`/artist/${currentUser2.username}`);
  } catch (err) {
    console.error("Error:", err.response?.data);
    alert("Error al actualizar perfil");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-bg text-white pt-24 pb-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
      `}</style>
      
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="syne text-3xl font-black tracking-tight mb-2">Editar perfil</h1>
        <p className="mono text-[10px] text-white/30 uppercase tracking-widest mb-8">
          Configura tu información pública
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              {avatarPreview && (
                <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              )}
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">
              Banner
            </label>
            {bannerPreview && (
              <img src={bannerPreview} alt="Banner"  referrerPolicy="no-referrer" className="w-full h-32 object-cover rounded-lg mb-3" />
            )}
            <input
              type="file"
              name="banner"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary cursor-pointer"
            />
          </div>

          {/* Nombre para mostrar */}
          <div>
            <label className="mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">
              Nombre público
            </label>
            <input
              type="text"
              name="display_name"
              value={profile.display_name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="Tu nombre artístico"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">
              Biografía
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Cuéntanos sobre ti..."
            />
          </div>

          {/* Redes sociales */}
          <div className="space-y-4">
            <h3 className="mono text-[10px] text-white/30 uppercase tracking-widest">Redes sociales</h3>
            
            <input
              type="url"
              name="instagram_url"
              value={profile.instagram_url}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="Instagram URL"
            />
            
            <input
              type="url"
              name="twitter_url"
              value={profile.twitter_url}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="Twitter URL"
            />
            
            <input
              type="url"
              name="youtube_url"
              value={profile.youtube_url}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="YouTube URL"
            />
            
            <input
              type="url"
              name="soundcloud_url"
              value={profile.soundcloud_url}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="SoundCloud URL"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer transition-all hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-primary text-bg font-bold cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "#00c9b1" }}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}