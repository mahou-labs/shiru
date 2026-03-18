import { useEffect } from "react";
import { useSidebar, type SecondarySidebarConfig } from "@/contexts/sidebar-context";

export function useSecondarySidebar(config: SecondarySidebarConfig | null) {
  const { registerSecondarySidebar, setIsCollapsed } = useSidebar();

  useEffect(() => {
    registerSecondarySidebar(config);

    if (config?.collapsePrimaryByDefault) {
      setIsCollapsed(true);
    }

    return () => {
      registerSecondarySidebar(null);
    };
  }, [config, registerSecondarySidebar, setIsCollapsed]);
}
