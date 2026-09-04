export const SWAGGER = {
  doc: {
    title: "EventEase API",
    description: "EventEase MVP API",
    version: "0.1",
    route: "docs",
  },

  tags: {
    auth: "auth",
    events: "events",
    checkout: "checkout",
    payment: "payment",
    profile: "profile",
  },

  auth: {
    checkEmail: "Check if email exists",
    register: "Register organizer",
    login: "Login",
    refresh: "Rotate refresh token and return new tokens",
    logout: "Logout (invalidate refresh token)",
    me: "Get current user",
  },

  events: {
    listPublic: "List published public events",
    getPublicByPublicId: "Get published public event by publicId",
    listMine: "List my events",
    getById: "Get my event by id",
    create: "Create event",
    update: "Update event",
    updateCover: "Update event cover image URL",
    uploadCover: "Upload event cover image to Cloudinary and save URL",
    publish: "Publish event",
    unpublish: "Unpublish event",
    remove: "Delete event",
    addTicketType: "Add ticket type to event",
    updateTicketType: "Update ticket type",
    deleteTicketType: "Delete ticket type",
  },

  checkout: {
    checkout: "Create an order and return Stripe Checkout session URL",
  },

  payment: {
    stripeWebhook: "Stripe webhook endpoint (payment confirmation)",
  },

  profile: {
    updateProfile: "Update my profile information",
    updateAvatar: "Update my avatar URL (after Cloudinary upload)",
    uploadAvatar: "Upload avatar image to Cloudinary and save URL",
    updateCover: "Update my organizer cover image URL",
    uploadCover: "Upload organizer cover image to Cloudinary and save URL",
  },
} as const
