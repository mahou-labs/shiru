import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  IconCircleUserOutlineDuo18,
  IconUserPlusOutlineDuo18,
  IconTrashOutlineDuo18,
  IconGearOutlineDuo18,
  IconDoorOpenOutlineDuo18,
} from "nucleo-ui-outline-duo-18";
import { useState } from "react";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@shiru/ui/avatar";
import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shiru/ui/card";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@shiru/ui/dialog";
import { Field, FieldError, FieldLabel } from "@shiru/ui/field";
import { Form } from "@shiru/ui/form";
import { Input } from "@shiru/ui/input";
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from "@shiru/ui/select";
import { Skeleton } from "@shiru/ui/skeleton";
import { cn } from "@/utils/cn";
import { orpc } from "@/utils/orpc-client";
import { toastManager } from "@shiru/ui/toast";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { orgInvitesCollection } from "@/utils/collections";

const inviteSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const Route = createFileRoute("/_app/settings/organization")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [slugCheckTimeout, setSlugCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const { data: session } = useQuery(orpc.user.getSession.queryOptions());

  // Fetch organization data
  const { data: orgData, isPending: isOrgPending } = useQuery(
    orpc.organization.getFullOrg.queryOptions(),
  );
  const { data: membersData, isPending: isMembersPending } = useQuery(
    orpc.organization.getMembers.queryOptions(),
  );
  // const { data: invitesData, isPending: isInvitesPending } = useQuery(
  //   orpc.orgInvite.list.queryOptions(),
  // );

  const { data: orgInvites, isLoading: isInvitesPending } = useLiveQuery((q) =>
    q
      .from({ orgInvites: orgInvitesCollection })
      .where(({ orgInvites }) => eq(orgInvites.status, "pending")),
  );

  const isPending = isOrgPending || isMembersPending || isInvitesPending;

  // Mutations
  const { mutateAsync: updateOrg } = useMutation(orpc.organization.updateOrg.mutationOptions());
  const { mutateAsync: updateOrgLogo } = useMutation(
    orpc.organization.updateOrgLogo.mutationOptions(),
  );
  const { mutateAsync: deleteOrg } = useMutation(orpc.organization.deleteOrg.mutationOptions());
  const { mutateAsync: removeMember } = useMutation(
    orpc.organization.removeMember.mutationOptions(),
  );
  const { mutateAsync: updateMemberRole } = useMutation(
    orpc.organization.updateMemberRole.mutationOptions(),
  );
  const { mutateAsync: leaveOrg } = useMutation(orpc.organization.leaveOrg.mutationOptions());
  const { mutateAsync: checkSlugAvailability } = useMutation(
    orpc.organization.checkSlugAvailability.mutationOptions(),
  );

  // Get current user from members data to determine permissions
  const currentUser = membersData?.members?.find((member) => member.user.id === session?.user.id);
  const isOwner = currentUser?.role === "owner";
  const canManageMembers = isOwner || currentUser?.role === "admin";

  // Forms
  const inviteForm = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: inviteSchema },
    onSubmit: async ({ value }) => {
      orgInvitesCollection.insert({
        id: "",
        createdAt: new Date(),
        email: value.email,
        role: "member",
        expiresAt: new Date(Date.now() + 86400000),
        inviterId: currentUser?.user.id || "",
        organizationId: session?.session.activeOrganizationId || "",
        status: "pending",
      });
      setIsInviteDialogOpen(false);
      inviteForm.reset();
      // try {
      //   await createInvite({ email: value.email, role: "member" });
      //   await queryClient.invalidateQueries(orpc.orgInvite.list.queryOptions());
      //   toastManager.add({ title: "Invitation sent", type: "success" });
      //   setIsInviteDialogOpen(false);
      //   inviteForm.reset();
      // } catch (error) {
      //   console.error(error);
      //   toastManager.add({
      //     title: "Failed to invite member, try again later",
      //     type: "error",
      //   });
      // }
    },
  });

  const orgForm = useForm({
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
    onSubmit: async ({ value }) => {
      try {
        // Update org name/slug if changed
        if (value.name !== orgData?.name || value.slug !== orgData?.slug) {
          await updateOrg({
            ...(value.name !== orgData?.name && { name: value.name }),
            ...(value.slug !== orgData?.slug && { slug: value.slug }),
          });
        }

        // Update logo if changed (including clearing it)
        if (value.logo !== (orgData?.logo || "")) {
          await updateOrgLogo({ logo: value.logo });
        }

        await queryClient.invalidateQueries(orpc.organization.getFullOrg.queryOptions());
        toastManager.add({ title: "Organization updated successfully", type: "success" });
      } catch (error) {
        console.error(error);
        toastManager.add({
          title: "Failed to update organization",
          type: "error",
        });
      }
    },
  });

  const deleteForm = useForm({
    defaultValues: { confirmText: "" },
    onSubmit: async ({ value }) => {
      if (value.confirmText !== orgData?.name) {
        toastManager.add({
          title: "Please type the organization name to confirm deletion",
          type: "error",
        });
        return;
      }
      try {
        await deleteOrg({});
        toastManager.add({ title: "Organization deleted successfully", type: "success" });
        // Redirect will happen automatically when the organization is deleted
      } catch (error) {
        console.error(error);
        toastManager.add({
          title: "Failed to delete organization",
          type: "error",
        });
      }
    },
  });

  // Update form defaults when org data loads
  if (orgData && !orgForm.state.values.name && !orgForm.state.values.slug) {
    orgForm.setFieldValue("name", orgData.name);
    orgForm.setFieldValue("slug", orgData.slug);
    orgForm.setFieldValue("logo", orgData.logo || "");
  }

  // Handle slug availability checking
  const handleSlugChange = async (value: string) => {
    orgForm.setFieldValue("slug", value);

    if (slugCheckTimeout) {
      clearTimeout(slugCheckTimeout);
    }

    if (value && value !== orgData?.slug) {
      const timeout = setTimeout(async () => {
        try {
          const isAvailable = await checkSlugAvailability(value);
          if (!isAvailable) {
            // Handle slug unavailable feedback
            toastManager.add({
              title: "This slug is already taken",
              type: "error",
            });
          }
        } catch (error) {
          console.error("Slug check error:", error);
        }
      }, 500);
      setSlugCheckTimeout(timeout);
    }
  };

  // Handle member role update
  const handleRoleUpdate = async (memberId: string, newRole: "admin" | "member") => {
    try {
      await updateMemberRole({ memberId, role: newRole });
      await queryClient.invalidateQueries(orpc.organization.getMembers.queryOptions());
      toastManager.add({ title: "Member role updated", type: "success" });
    } catch (error) {
      console.error(error);
      toastManager.add({ title: "Failed to update member role", type: "error" });
    }
  };

  // Handle member removal
  const handleRemoveMember = async (memberIdOrEmail: string) => {
    try {
      await removeMember({ memberIdOrEmail });
      await queryClient.invalidateQueries(orpc.organization.getMembers.queryOptions());
      toastManager.add({ title: "Member removed successfully", type: "success" });
      setMemberToDelete(null);
    } catch (error) {
      console.error(error);
      toastManager.add({ title: "Failed to remove member", type: "error" });
    }
  };

  // Handle leaving organization
  const handleLeaveOrg = async () => {
    try {
      await leaveOrg({});
      toastManager.add({ title: "Left organization successfully", type: "success" });
      // Redirect will happen automatically
    } catch (error) {
      console.error(error);
      toastManager.add({ title: "Failed to leave organization", type: "error" });
    }
  };

  // Handle invite revocation
  const handleRevokeInvite = async (inviteId: string) => {
    orgInvitesCollection.delete(inviteId);
    // try {
    //   await deleteInvite({ id: inviteId });
    //   await queryClient.invalidateQueries(orpc.orgInvite.list.queryOptions());
    //   toastManager.add({ title: "Invitation revoked", type: "success" });
    // } catch (error) {
    //   console.error(error);
    //   toastManager.add({ title: "Failed to revoke invitation", type: "error" });
    // }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* General Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <IconGearOutlineDuo18 className="mr-2 size-5 inline" />
            General Settings
          </CardTitle>
          <CardDescription>
            Manage your organization's basic information and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                await orgForm.handleSubmit();
              }}
            >
              <div className="space-y-4">
                <orgForm.Field name="name">
                  {(field) => (
                    <Field>
                      <FieldLabel>Organization Name</FieldLabel>
                      <Input
                        disabled={orgForm.state.isSubmitting}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Acme Corp"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <FieldError key={String(error)}>{String(error)}</FieldError>
                      ))}
                    </Field>
                  )}
                </orgForm.Field>

                <orgForm.Field name="slug">
                  {(field) => (
                    <Field>
                      <FieldLabel>Organization Slug</FieldLabel>
                      <Input
                        disabled={orgForm.state.isSubmitting}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="acme-corp"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <FieldError key={String(error)}>{String(error)}</FieldError>
                      ))}
                    </Field>
                  )}
                </orgForm.Field>

                <orgForm.Field name="logo">
                  {(field) => (
                    <Field>
                      <FieldLabel>Logo URL (Optional)</FieldLabel>
                      <Input
                        disabled={orgForm.state.isSubmitting}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <FieldError key={String(error)}>{String(error)}</FieldError>
                      ))}
                    </Field>
                  )}
                </orgForm.Field>

                <div className="flex justify-start">
                  <Button
                    disabled={!orgForm.state.canSubmit || orgForm.state.isSubmitting}
                    type="submit"
                  >
                    {orgForm.state.isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <IconCircleUserOutlineDuo18 className="mr-2 size-5 inline" />
            Members
          </CardTitle>
          <CardDescription>
            Manage team members and their roles within the organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-4">
            {isPending ? (
              <MemberSkeleton />
            ) : (
              <>
                {membersData?.members?.map((member) => (
                  <Member
                    key={member.id}
                    member={member}
                    currentUser={currentUser}
                    canManageMembers={canManageMembers}
                    onRoleUpdate={handleRoleUpdate}
                    onRemove={(id) => setMemberToDelete(id)}
                    onLeave={handleLeaveOrg}
                  />
                ))}

                {orgInvites.map((invite) => (
                  <PendingInvite
                    key={invite.id}
                    invite={invite}
                    canManageMembers={canManageMembers}
                    onRevoke={handleRevokeInvite}
                  />
                ))}
              </>
            )}
          </div>

          {canManageMembers && (
            <Button className="mt-4" onClick={() => setIsInviteDialogOpen(true)} variant="outline">
              <IconUserPlusOutlineDuo18 className="mr-2 size-4" />
              Invite Member
            </Button>
          )}

          {!isOwner && (
            <Button className="mt-4 ml-2" variant="outline" onClick={handleLeaveOrg}>
              <IconDoorOpenOutlineDuo18 className="mr-2 size-4" />
              Leave Organization
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && orgData && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">
              <IconTrashOutlineDuo18 className="mr-2 size-5 inline" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that permanently affect your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-destructive/80 text-sm mb-4">
                This action cannot be undone. This will permanently delete the organization and all
                associated data.
              </p>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <IconTrashOutlineDuo18 className="mr-2 size-4" />
                Delete Organization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Member Dialog */}
      <Dialog onOpenChange={setIsInviteDialogOpen} open={isInviteDialogOpen}>
        <DialogPopup className="sm:max-w-sm">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              inviteForm.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <DialogPanel className="grid gap-4">
              <inviteForm.Field name="email" validators={{ onChange: inviteSchema.shape.email }}>
                {(field) => (
                  <Field>
                    <FieldLabel>Email Address</FieldLabel>
                    <Input
                      disabled={inviteForm.state.isSubmitting}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="member@example.com"
                      type="email"
                      value={field.state.value}
                    />
                    {field.state.meta.errors.map((error) => (
                      <FieldError key={String(error)}>{String(error)}</FieldError>
                    ))}
                  </Field>
                )}
              </inviteForm.Field>
            </DialogPanel>
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    disabled={inviteForm.state.isSubmitting}
                    onClick={() => setIsInviteDialogOpen(false)}
                    type="button"
                    variant="ghost"
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                disabled={!inviteForm.state.canSubmit || inviteForm.state.isSubmitting}
                type="submit"
              >
                {inviteForm.state.isSubmitting ? "Sending..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </Form>
        </DialogPopup>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
        <DialogPopup className="sm:max-w-md">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              deleteForm.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Delete Organization</DialogTitle>
            </DialogHeader>
            <DialogPanel className="grid gap-4">
              <p className="text-muted-foreground text-sm">
                This action cannot be undone. Please type <strong>{orgData?.name}</strong> to
                confirm.
              </p>
              <deleteForm.Field name="confirmText">
                {(field) => (
                  <Field>
                    <FieldLabel>Confirmation</FieldLabel>
                    <Input
                      disabled={deleteForm.state.isSubmitting}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Type organization name here"
                      value={field.state.value}
                    />
                    {field.state.meta.errors.map((error) => (
                      <FieldError key={String(error)}>{String(error)}</FieldError>
                    ))}
                  </Field>
                )}
              </deleteForm.Field>
            </DialogPanel>
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    disabled={deleteForm.state.isSubmitting}
                    onClick={() => setIsDeleteDialogOpen(false)}
                    type="button"
                    variant="ghost"
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                disabled={!deleteForm.state.canSubmit || deleteForm.state.isSubmitting}
                type="submit"
                variant="destructive"
              >
                {deleteForm.state.isSubmitting ? "Deleting..." : "Delete Organization"}
              </Button>
            </DialogFooter>
          </Form>
        </DialogPopup>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog onOpenChange={(open) => !open && setMemberToDelete(null)} open={!!memberToDelete}>
        <DialogPopup className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
          </DialogHeader>
          <DialogPanel>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to remove this member from the organization?
            </p>
          </DialogPanel>
          <DialogFooter>
            <DialogClose
              render={
                <Button onClick={() => setMemberToDelete(null)} type="button" variant="ghost" />
              }
            >
              Cancel
            </DialogClose>
            <Button
              onClick={() => memberToDelete && handleRemoveMember(memberToDelete)}
              variant="destructive"
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

type MemberRole = "owner" | "admin" | "member";

type MemberData = {
  id: string;
  role: MemberRole;
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
};

type MemberProps = {
  member: MemberData;
  currentUser?: MemberData;
  canManageMembers: boolean;
  onRoleUpdate: (memberId: string, role: "admin" | "member") => void;
  onRemove: (memberIdOrEmail: string) => void;
  onLeave: () => void;
  className?: string;
};

type InviteData = {
  id: string;
  email: string;
  role: MemberRole;
  status: string;
};

type PendingInviteProps = {
  invite: InviteData;
  canManageMembers: boolean;
  onRevoke: (inviteId: string) => void;
  className?: string;
};

const roleColors = {
  owner: "bg-primary text-primary-foreground border-primary",
  admin: "bg-info text-info-foreground border-info",
  member: "bg-muted text-muted-foreground border-border",
} as const;

const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
} as const;

function Member({
  member,
  currentUser,
  canManageMembers,
  onRoleUpdate,
  onRemove,
  onLeave,
  className,
}: MemberProps) {
  const { user, role, id } = member;
  const name = user.name || user.email;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isCurrentUser = currentUser?.user.id === user.id;
  const canChangeRole = canManageMembers && !isCurrentUser && role !== "owner";
  const canRemove = canManageMembers && !isCurrentUser && role !== "owner";
  const canLeaveOrg = isCurrentUser && role !== "owner";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-0",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage alt={`${name}'s avatar`} src={user.image} />
          <AvatarFallback>
            {initials || <IconCircleUserOutlineDuo18 className="size-5" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="truncate font-medium text-card-foreground">
              {name} {isCurrentUser && "(You)"}
            </span>
          </div>
          <span className="truncate text-sm text-muted-foreground">{user.email}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-start gap-2 sm:justify-end">
        {/* Role Management */}
        {canChangeRole ? (
          <Select
            value={role}
            onValueChange={(newRole) => onRoleUpdate(id, newRole as "admin" | "member")}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectPopup>
          </Select>
        ) : (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium text-xs",
              roleColors[role],
            )}
          >
            {roleLabels[role]}
          </span>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1">
          {canRemove && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(user.email)}
              aria-label={`Remove ${name} from organization`}
            >
              <IconTrashOutlineDuo18 className="size-4 text-destructive" />
            </Button>
          )}
          {canLeaveOrg && (
            <Button size="sm" variant="ghost" onClick={onLeave}>
              <IconDoorOpenOutlineDuo18 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingInvite({ invite, canManageMembers, onRevoke, className }: PendingInviteProps) {
  const name = invite.email.split("@")[0];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-0",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarFallback>
              {initials || <IconCircleUserOutlineDuo18 className="size-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="-bottom-1 -right-1 absolute size-4 rounded-full border-2 border-card bg-warning/20" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="truncate font-medium text-card-foreground">{name}</span>
            <span className="inline-flex w-fit items-center rounded-full border border-warning bg-warning/10 px-2 py-0.5 font-medium text-warning text-xs">
              Pending
            </span>
          </div>
          <span className="truncate text-sm text-muted-foreground">{invite.email}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-start gap-2 sm:justify-end">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium text-xs",
            roleColors[invite.role],
          )}
        >
          {roleLabels[invite.role]}
        </span>

        {canManageMembers && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRevoke(invite.id)}
            aria-label={`Revoke invite for ${invite.email}`}
          >
            <IconTrashOutlineDuo18 className="size-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}

function MemberSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-0">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-start gap-2 sm:justify-end">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}
