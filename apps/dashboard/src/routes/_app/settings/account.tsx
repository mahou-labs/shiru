import { Button } from "@shiru/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@shiru/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@shiru/ui/components/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@shiru/ui/components/select";
import { toastManager } from "@shiru/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Page } from "@/components/page";
import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";
import { sessionQuery, useSession } from "@/lib/queries";

export const Route = createFileRoute("/_app/settings/account")({
  component: AccountSettings,
});

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function AccountSettings() {
  return (
    <Page title="Account" description="Your profile, appearance, and sign-in details.">
      <ProfileCard />
      <AppearanceCard />
      <PasswordCard />
      <DeleteAccountCard />
    </Page>
  );
}

function ProfileCard() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (name: string) => authClient.updateUser({ name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(sessionQuery);
      toastManager.add({ type: "success", title: "Profile updated" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How you appear to your teammates.</CardDescription>
      </CardHeader>
      <Form
        key={user.name}
        className="contents"
        onFormSubmit={(values) => update.mutate(values.name as string)}
      >
        <CardPanel className="flex flex-col gap-4">
          <Field name="name">
            <FieldLabel>Name</FieldLabel>
            <Input defaultValue={user.name} autoComplete="name" required minLength={2} />
            <FieldError />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={user.email} disabled />
          </Field>
        </CardPanel>
        <CardFooter className="justify-end">
          <Button type="submit" loading={update.isPending}>
            Save
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}

function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how Shiru looks on this device.</CardDescription>
      </CardHeader>
      <CardPanel>
        <Field>
          <FieldLabel>Theme</FieldLabel>
          <Select items={themes} value={theme} onValueChange={(value) => value && setTheme(value)}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {themes.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </Field>
      </CardPanel>
    </Card>
  );
}

type PasswordChange = { currentPassword: string; newPassword: string };

function PasswordCard() {
  const [formKey, setFormKey] = useState(0);
  const change = useMutation({
    mutationFn: (values: PasswordChange) =>
      authClient.changePassword({ ...values, revokeOtherSessions: true }),
    onSuccess: () => {
      setFormKey((key) => key + 1);
      toastManager.add({
        type: "success",
        title: "Password changed",
        description: "Other devices have been signed out.",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Changing it signs you out on your other devices.</CardDescription>
      </CardHeader>
      <Form
        key={formKey}
        className="contents"
        onFormSubmit={(values) => change.mutate(values as PasswordChange)}
      >
        <CardPanel className="flex flex-col gap-4">
          <Field name="currentPassword">
            <FieldLabel>Current password</FieldLabel>
            <Input type="password" autoComplete="current-password" required />
            <FieldError />
          </Field>
          <Field name="newPassword">
            <FieldLabel>New password</FieldLabel>
            <Input type="password" autoComplete="new-password" required minLength={8} />
            <FieldDescription>At least 8 characters.</FieldDescription>
            <FieldError />
          </Field>
        </CardPanel>
        <CardFooter className="justify-end">
          <Button type="submit" loading={change.isPending}>
            Change password
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}

function DeleteAccountCard() {
  const remove = useMutation({
    mutationFn: (password: string) => authClient.deleteUser({ password }),
    onSuccess: () => window.location.assign("/auth/sign-up"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Permanently delete your account and sign out everywhere. This can't be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <Dialog>
          <DialogTrigger render={<Button variant="destructive-outline" />}>
            Delete account
          </DialogTrigger>
          <DialogPopup className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>Enter your password to confirm.</DialogDescription>
            </DialogHeader>
            <Form
              className="contents"
              onFormSubmit={(values) => remove.mutate(values.password as string)}
            >
              <DialogPanel>
                <Field name="password">
                  <FieldLabel>Password</FieldLabel>
                  <Input type="password" autoComplete="current-password" required />
                  <FieldError />
                </Field>
              </DialogPanel>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                <Button type="submit" variant="destructive" loading={remove.isPending}>
                  Delete account
                </Button>
              </DialogFooter>
            </Form>
          </DialogPopup>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
