import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
export function useChapterAccess() {
  const { user, isAdmin } = useAuth();
  const [chapters, setChapters] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!user) {
      setChapters([]);
      setLoading(false);
      return;
    }
    supabase.rpc("my_managed_chapters").then(({ data }) => {
      if (active) {
        setChapters(data || []);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user, isAdmin]);
  return {
    chapters,
    loading,
    hasChapterAccess: isAdmin || chapters.length > 0,
  };
}
