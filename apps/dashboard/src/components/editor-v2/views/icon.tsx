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

/** The Phosphor icons Nimbus components draw themselves, bundled so they show without loading the set. */
export const PHOSPHOR = {
  caretRight:
    "m181.66 133.66l-80 80a8 8 0 0 1-11.32-11.32L164.69 128L90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32",
  copy: "M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z",
  file: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 51.31L188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48z",
  folder:
    "M216 72h-84.69L104 44.69A15.86 15.86 0 0 0 92.69 40H40a16 16 0 0 0-16 16v144.62A15.4 15.4 0 0 0 39.38 216h177.51A15.13 15.13 0 0 0 232 200.89V88a16 16 0 0 0-16-16M40 56h52.69l16 16H40Zm176 144H40V88h176Z",
} as const;

/** One of the bundled icons, sized in `em` like Nimbus's `Icon`. */
export function Phosphor({ name, className }: { name: keyof typeof PHOSPHOR; className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 256 256" aria-hidden="true" className={className}>
      <path fill="currentColor" d={PHOSPHOR[name]} />
    </svg>
  );
}
