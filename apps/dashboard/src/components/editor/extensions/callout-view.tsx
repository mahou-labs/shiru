import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import {
  IconAlertWarningOutlineDuo18,
  IconCircleInfoOutlineDuo18,
  IconLightbulbOutlineDuo18,
  IconOctagonWarningOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

import type { CalloutType } from "./callout-extension";

const calloutConfig: Record<
  CalloutType,
  { icon: React.FC<{ className?: string }>; label: string }
> = {
  info: { icon: IconCircleInfoOutlineDuo18, label: "Info" },
  warning: { icon: IconAlertWarningOutlineDuo18, label: "Warning" },
  danger: { icon: IconOctagonWarningOutlineDuo18, label: "Danger" },
  tip: { icon: IconLightbulbOutlineDuo18, label: "Tip" },
};

const calloutTypes: CalloutType[] = ["info", "warning", "danger", "tip"];

export function CalloutView({ node, updateAttributes }: ReactNodeViewProps) {
  const type: CalloutType =
    node.attrs.type === "warning" || node.attrs.type === "danger" || node.attrs.type === "tip"
      ? node.attrs.type
      : "info";
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <NodeViewWrapper className={`callout callout-${type}`} data-callout-type={type}>
      <div className="callout-header" contentEditable={false}>
        <Icon className="callout-header-icon" />
        <div className="callout-type-buttons">
          {calloutTypes.map((t) => {
            const TypeIcon = calloutConfig[t].icon;
            return (
              <button
                key={t}
                type="button"
                className={`callout-type-button ${t === type ? "is-active" : ""}`}
                onClick={() => updateAttributes({ type: t })}
                title={calloutConfig[t].label}
              >
                <TypeIcon />
              </button>
            );
          })}
        </div>
      </div>
      <NodeViewContent className="callout-content" />
    </NodeViewWrapper>
  );
}
