/**
 * MDX globals registry: components available inside MDX without `import`.
 * Site content cannot import anything, so this list is the whole component
 * surface a site can use.
 */

import {
  Accordion,
  AccordionContent,
  AccordionGroup,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Aside } from "./components/ui/aside";
import { Badge } from "./components/ui/badge";
import { Card } from "./components/ui/card";
import { CardGrid } from "./components/ui/card-grid";
import { CodeGroup } from "./components/ui/code-group";
import { CopyPrompt } from "./components/ui/copy-prompt";
import { Embed } from "./components/ui/embed";
import { FileTree } from "./components/ui/file-tree";
import { Frame } from "./components/ui/frame";
import { LinkButton } from "./components/ui/link-button";
import { LinkCard } from "./components/ui/link-card";
import { PackageManagers } from "./components/ui/package-managers";
import { Step, Steps } from "./components/ui/steps";
import { Tabs, TabItem } from "./components/ui/tabs";

export const components = {
  Accordion,
  AccordionContent,
  AccordionGroup,
  AccordionTrigger,
  Aside,
  Badge,
  Card,
  CardGrid,
  CodeGroup,
  CopyPrompt,
  Embed,
  FileTree,
  Frame,
  LinkButton,
  LinkCard,
  PackageManagers,
  Step,
  Steps,
  TabItem,
  Tabs,
};
