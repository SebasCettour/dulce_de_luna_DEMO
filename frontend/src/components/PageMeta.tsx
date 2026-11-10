import { useEffect } from "react";

export default function PageMeta() {
  useEffect(() => {
    document.title = "Tienda natural | Demo ficticia";
  }, []);
  return null;
}
