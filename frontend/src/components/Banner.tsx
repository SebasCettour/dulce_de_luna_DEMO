import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiUrl } from "../api";
import useAuth from "../context/AuthContext";
import { demoFetch } from "../demo/store";

const BannerPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [bannerMessages, setBannerMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    demoFetch(apiUrl("/banner"))
      .then((res) => res.json())
      .then((data) => setBannerMessages(data.messages || []))
      .catch(() => toast.error("Error cargando banner"));
  }, []);

  const handleSaveBanner = async () => {
    const cleaned = bannerMessages.map((m) => m.trim()).filter(Boolean);

    if (!cleaned.length) {
      toast.error("El banner no puede estar vacío");
      return;
    }

    try {
      setLoading(true);

      const res = await demoFetch(apiUrl("/banner"), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ messages: cleaned }),
      });

      if (!res.ok) throw new Error();

      toast.success("Banner actualizado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-pink-700">Banner Promocional</h2>

      <div className="grid lg:grid-cols-2 gap-5">
        <textarea
          className="w-full h-40 p-3 border rounded-lg"
          value={bannerMessages.join("\n")}
          onChange={(e) => setBannerMessages(e.target.value.split("\n"))}
        />

        <div className="bg-pink-700 text-white p-3 rounded-lg text-sm">
          {bannerMessages.length ? (
            bannerMessages.map((m, i) => <div key={i}>• {m}</div>)
          ) : (
            <span>No hay mensajes</span>
          )}
        </div>
      </div>

      <button
        onClick={handleSaveBanner}
        className="btn-primary"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
};

export default BannerPage;
