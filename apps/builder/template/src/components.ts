/**
 * MDX globals registry: components available inside MDX without `import`.
 * Site content cannot import anything, so this list is the whole component
 * surface a site can use.
 */

import { Aside } from "./components/ui/aside";
import { Card } from "./components/ui/card";
import { CardGrid } from "./components/ui/card-grid";
import { PackageManagers } from "./components/ui/package-managers";
import { Step, Steps } from "./components/ui/steps";
import { Tabs, TabItem } from "./components/ui/tabs";

export const components = {
  Aside,
  Card,
  CardGrid,
  PackageManagers,
  Step,
  Steps,
  TabItem,
  Tabs,
};
