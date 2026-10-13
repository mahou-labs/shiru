import { getIconData, iconToSVG } from "@iconify/utils";
import { useEffect, useState } from "react";

type IconSet = Parameters<typeof getIconData>[0];
type Svg = ReturnType<typeof iconToSVG>;

/** Phosphor is the only icon set the site template installs, so it is the only one a page can name. */
let phosphor: Promise<IconSet> | undefined;

function loadPhosphor(): Promise<IconSet> {
  phosphor ??= import("@iconify-json/ph/icons.json").then((set) => set.default as IconSet);
  return phosphor;
}

/** An icon named the way Nimbus's `Icon` takes it, such as `ph:lightning`. Unknown names draw nothing. */
export function Icon({ name, className }: { name: string; className?: string }) {
  const [svg, setSvg] = useState<Svg | null>(null);
  const [set, icon] = name.split(":");

  useEffect(() => {
    setSvg(null);
    if (set !== "ph" || !icon) return;
    let current = true;
    void loadPhosphor().then((json) => {
      const data = getIconData(json, icon);
      if (current) setSvg(data ? iconToSVG(data) : null);
    });
    return () => {
      current = false;
    };
  }, [set, icon]);

  if (!svg) return null;
  return (
    <svg
      {...svg.attributes}
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: svg.body }}
    />
  );
}
