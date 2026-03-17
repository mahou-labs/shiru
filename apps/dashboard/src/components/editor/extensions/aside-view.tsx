import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import {
  IconAlertWarningOutlineDuo18,
  IconCircleInfoOutlineDuo18,
  IconLightbulbOutlineDuo18,
  IconOctagonWarningOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

import type { AsideVariant } from "./aside-extension";

const asideConfig: Record<AsideVariant, { icon: React.FC<{ className?: string }>; label: string }> =
  {
    note: { icon: IconCircleInfoOutlineDuo18, label: "Note" },
    tip: { icon: IconLightbulbOutlineDuo18, label: "Tip" },
    caution: { icon: IconAlertWarningOutlineDuo18, label: "Caution" },
    danger: { icon: IconOctagonWarningOutlineDuo18, label: "Danger" },
  };

const asideVariants: AsideVariant[] = ["note", "tip", "caution", "danger"];

export function AsideView({ node, updateAttributes }: ReactNodeViewProps) {
  const variant: AsideVariant =
    node.attrs.variant === "tip" ||
    node.attrs.variant === "caution" ||
    node.attrs.variant === "danger"
      ? node.attrs.variant
      : "note";

  const config = asideConfig[variant];
  const Icon = config.icon;

  return (
    <NodeViewWrapper className={`aside aside-${variant}`} data-aside-variant={variant}>
      <div className="aside-header" contentEditable={false}>
        <div className="aside-header-label">
          <Icon className="aside-header-icon" />
          <span className="aside-header-text">{config.label}</span>
        </div>
        <div className="aside-type-buttons">
          {asideVariants.map((v) => {
            const VariantIcon = asideConfig[v].icon;
            return (
              <button
                key={v}
                type="button"
                className={`aside-type-button ${v === variant ? "is-active" : ""}`}
                onClick={() => updateAttributes({ variant: v })}
                title={asideConfig[v].label}
              >
                <VariantIcon />
              </button>
            );
          })}
        </div>
      </div>
      <NodeViewContent className="aside-content" />
    </NodeViewWrapper>
  );
}
