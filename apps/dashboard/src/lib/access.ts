import type { AccessResult } from "../../../api/src/utils/billing";

const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

export function accessLabel(access: AccessResult) {
  switch (access.kind) {
    case "subscription":
      return "Subscribed";
    case "trial":
      return `Trial until ${dateFormat.format(access.endsAt)}`;
    case "denied":
      return access.reason === "trial_expired" ? "Trial ended" : "No active plan";
  }
}
