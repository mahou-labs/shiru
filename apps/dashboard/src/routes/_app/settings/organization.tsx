import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@shiru/ui/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@shiru/ui/components/avatar";
import { Badge } from "@shiru/ui/components/badge";
import { Button } from "@shiru/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardFrame,
  CardFrameAction,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
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
import { Field, FieldError, FieldLabel } from "@shiru/ui/components/field";
import { Form } from "@shiru/ui/components/form";
import { Input } from "@shiru/ui/components/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@shiru/ui/components/select";
import { Skeleton } from "@shiru/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shiru/ui/components/table";
import { toastManager } from "@shiru/ui/components/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  IconCopyOutlineDuo18,
  IconTrashOutlineDuo18,
  IconUserPlusOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useState } from "react";

import { Page } from "@/components/page";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/initials";
import { activeOrganizationQuery, useSession } from "@/lib/queries";

export const Route = createFileRoute("/_app/settings/organization")({
  component: OrganizationSettings,
});

type Organization = NonNullable<
  Awaited<ReturnType<typeof authClient.organization.getFullOrganization>>
>;
type Member = Organization["members"][number];
type Invitation = Organization["invitations"][number];

const assignableRoles = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

const roleLabels: Record<string, string> = { owner: "Owner", admin: "Admin", member: "Member" };

function OrganizationSettings() {
  const { user } = useSession();
  const { data: organization } = useQuery(activeOrganizationQuery);

  if (!organization) {
    return (
      <Page title="Organization">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </Page>
    );
  }

  const role = organization.members.find((member) => member.userId === user.id)?.role;
  const canManage = role === "owner" || role === "admin";

  return (
    <Page title="Organization" description="Details, members, and invitations.">
      <GeneralCard
        key={[organization.id, organization.name, organization.slug, organization.logo].join()}
        organization={organization}
        canManage={canManage}
      />
      <MembersCard organization={organization} canManage={canManage} />
      {role === "owner" ? (
        <DeleteOrganizationCard organization={organization} />
      ) : (
        <LeaveOrganizationCard organization={organization} />
      )}
    </Page>
  );
}

type OrganizationDetails = { name: string; slug: string; logo: string };

function GeneralCard({
  organization,
  canManage,
}: {
  organization: Organization;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (data: OrganizationDetails) =>
      authClient.organization.update({ organizationId: organization.id, data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toastManager.add({ type: "success", title: "Organization updated" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Your organization's name, URL slug, and logo.</CardDescription>
      </CardHeader>
      <Form
        className="contents"
        onFormSubmit={(values) => update.mutate(values as OrganizationDetails)}
      >
        <CardPanel className="flex flex-col gap-4">
          <Field name="name" disabled={!canManage}>
            <FieldLabel>Name</FieldLabel>
            <Input defaultValue={organization.name} required />
            <FieldError />
          </Field>
          <Field name="slug" disabled={!canManage}>
            <FieldLabel>Slug</FieldLabel>
            <Input
              defaultValue={organization.slug}
              required
              minLength={3}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
            />
            <FieldError />
          </Field>
          <Field name="logo" disabled={!canManage}>
            <FieldLabel>Logo URL</FieldLabel>
            <Input
              type="url"
              defaultValue={organization.logo ?? ""}
              placeholder="https://example.com/logo.png"
            />
            <FieldError />
          </Field>
        </CardPanel>
        {canManage && (
          <CardFooter className="justify-end">
            <Button type="submit" loading={update.isPending}>
              Save
            </Button>
          </CardFooter>
        )}
      </Form>
    </Card>
  );
}

function MembersCard({
  organization,
  canManage,
}: {
  organization: Organization;
  canManage: boolean;
}) {
  const invitations = organization.invitations.filter(
    (invitation) => invitation.status === "pending",
  );

  return (
    <CardFrame>
      <CardFrameHeader>
        <CardFrameTitle>Members</CardFrameTitle>
        <CardFrameDescription>People who can work in {organization.name}.</CardFrameDescription>
        {canManage && (
          <CardFrameAction>
            <InviteDialog organizationId={organization.id} />
          </CardFrameAction>
        )}
      </CardFrameHeader>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-36">Role</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {organization.members.map((member) => (
              <MemberRow key={member.id} member={member} canManage={canManage} />
            ))}
            {invitations.map((invitation) => (
              <InvitationRow key={invitation.id} invitation={invitation} canManage={canManage} />
            ))}
          </TableBody>
        </Table>
      </Card>
    </CardFrame>
  );
}

function MemberRow({ member, canManage }: { member: Member; canManage: boolean }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const editable = canManage && member.role !== "owner" && member.userId !== user.id;

  const updateRole = useMutation({
    mutationFn: (role: "admin" | "member") =>
      authClient.organization.updateMemberRole({ memberId: member.id, role }),
    onSuccess: () => queryClient.invalidateQueries(activeOrganizationQuery),
  });

  const remove = useMutation({
    mutationFn: () => authClient.organization.removeMember({ memberIdOrEmail: member.id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(activeOrganizationQuery);
      toastManager.add({ type: "success", title: `${member.user.name} was removed` });
    },
  });

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={member.user.image || undefined} />
            <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {member.user.name}
              {member.userId === user.id && <span className="text-muted-foreground"> (you)</span>}
            </p>
            <p className="truncate text-muted-foreground text-xs">{member.user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {editable ? (
          <Select
            items={assignableRoles}
            value={member.role}
            onValueChange={(role) => role && updateRole.mutate(role as "admin" | "member")}
          >
            <SelectTrigger size="sm" className="min-w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {assignableRoles.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        ) : (
          <Badge variant="outline">{roleLabels[member.role] ?? member.role}</Badge>
        )}
      </TableCell>
      <TableCell className="text-end">
        {editable && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="icon-sm" variant="ghost" aria-label={`Remove ${member.user.name}`} />
              }
            >
              <IconTrashOutlineDuo18 />
            </AlertDialogTrigger>
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {member.user.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  They'll lose access to this organization right away.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
                <Button
                  variant="destructive"
                  loading={remove.isPending}
                  onClick={() => remove.mutate()}
                >
                  Remove
                </Button>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  );
}

function InvitationRow({ invitation, canManage }: { invitation: Invitation; canManage: boolean }) {
  const queryClient = useQueryClient();

  const cancel = useMutation({
    mutationFn: () => authClient.organization.cancelInvitation({ invitationId: invitation.id }),
    onSuccess: () => queryClient.invalidateQueries(activeOrganizationQuery),
  });

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.id}`);
    toastManager.add({ type: "success", title: "Invitation link copied" });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials(invitation.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{invitation.email}</p>
            <p className="truncate text-muted-foreground text-xs">Invitation pending</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="warning">{roleLabels[invitation.role] ?? invitation.role}</Badge>
      </TableCell>
      <TableCell className="text-end">
        {canManage && (
          <div className="flex justify-end gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Copy invitation link"
              onClick={copyLink}
            >
              <IconCopyOutlineDuo18 />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Cancel invitation for ${invitation.email}`}
              loading={cancel.isPending}
              onClick={() => cancel.mutate()}
            >
              <IconTrashOutlineDuo18 />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

type NewInvitation = { email: string; role: "admin" | "member" };

function InviteDialog({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const invite = useMutation({
    mutationFn: (invitation: NewInvitation) =>
      authClient.organization.inviteMember({ ...invitation, organizationId }),
    onSuccess: async (_, { email }) => {
      await queryClient.invalidateQueries(activeOrganizationQuery);
      setOpen(false);
      toastManager.add({ type: "success", title: `Invitation sent to ${email}` });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <IconUserPlusOutlineDuo18 />
        Invite
      </DialogTrigger>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>We'll email them a link to join.</DialogDescription>
        </DialogHeader>
        <Form
          className="contents"
          onFormSubmit={(values) => invite.mutate(values as NewInvitation)}
        >
          <DialogPanel className="flex flex-col gap-4">
            <Field name="email">
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="teammate@example.com" required />
              <FieldError />
            </Field>
            <Field name="role">
              <FieldLabel>Role</FieldLabel>
              <Select items={assignableRoles} name="role" defaultValue="member">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {assignableRoles.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" loading={invite.isPending}>
              Send invitation
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}

async function exitOrganization() {
  const [next] = await authClient.organization.list();
  if (next) await authClient.organization.setActive({ organizationId: next.id });
  window.location.assign(next ? "/" : "/onboarding");
}

function DeleteOrganizationCard({ organization }: { organization: Organization }) {
  const [confirmation, setConfirmation] = useState("");

  const remove = useMutation({
    mutationFn: () => authClient.organization.delete({ organizationId: organization.id }),
    onSuccess: exitOrganization,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete organization</CardTitle>
        <CardDescription>
          Permanently delete {organization.name}, its members, and its data. This can't be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <Dialog onOpenChange={() => setConfirmation("")}>
          <DialogTrigger render={<Button variant="destructive-outline" />}>
            Delete organization
          </DialogTrigger>
          <DialogPopup className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete {organization.name}?</DialogTitle>
              <DialogDescription>
                Type <strong className="font-mono text-foreground">{organization.slug}</strong> to
                confirm.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <Field>
                <FieldLabel>Organization slug</FieldLabel>
                <Input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="off"
                />
              </Field>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <Button
                variant="destructive"
                disabled={confirmation !== organization.slug}
                loading={remove.isPending}
                onClick={() => remove.mutate()}
              >
                Delete organization
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function LeaveOrganizationCard({ organization }: { organization: Organization }) {
  const leave = useMutation({
    mutationFn: () => authClient.organization.leave({ organizationId: organization.id }),
    onSuccess: exitOrganization,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave organization</CardTitle>
        <CardDescription>
          You'll lose access to {organization.name} until someone invites you again.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive-outline" />}>
            Leave organization
          </AlertDialogTrigger>
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave {organization.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                You'll need a new invitation to come back.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
              <Button
                variant="destructive"
                loading={leave.isPending}
                onClick={() => leave.mutate()}
              >
                Leave
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
