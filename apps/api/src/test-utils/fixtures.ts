export const TEST_USER = {
  id: "user-001",
  name: "Test User",
  email: "test@example.com",
  emailVerified: true,
  image: null,
  createdAt: new Date("2026-03-01T00:00:00Z"),
  updatedAt: new Date("2026-03-01T00:00:00Z"),
};

export const TEST_ORG = {
  id: "org-001",
  name: "Test Org",
  slug: "test-org",
  logo: "https://example.com/logo.png",
  createdAt: new Date("2026-03-01T00:00:00Z"),
  metadata: null,
  repoUrl: "",
};

export const TEST_SESSION = {
  id: "session-001",
  userId: TEST_USER.id,
  token: "test-token-abc123",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date("2026-03-01T00:00:00Z"),
  updatedAt: new Date("2026-03-01T00:00:00Z"),
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
  activeOrganizationId: TEST_ORG.id as string | null,
};

export const TEST_SUBSCRIPTION = {
  id: "sub-001",
  organizationId: TEST_ORG.id,
  polarSubscriptionId: "polar-sub-001",
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

export const TEST_MEMBER = {
  id: "member-001",
  organizationId: TEST_ORG.id,
  userId: TEST_USER.id,
  role: "owner",
  createdAt: new Date("2026-03-01T00:00:00Z"),
};

export const TEST_INVITATION = {
  id: "invite-001",
  organizationId: TEST_ORG.id,
  email: "invited@example.com",
  role: "member",
  status: "pending",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date("2026-03-01T00:00:00Z"),
  inviterId: TEST_USER.id,
};
