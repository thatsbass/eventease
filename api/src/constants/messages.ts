export const MESSAGES = {
  auth: {
    emailOrUsernameInUse: "Email or username already in use",
    invalidCredentials: "Invalid credentials",
    invalidRefreshToken: "Invalid refresh token",
    invalidToken: "Invalid token",
  },

  events: {
    eventNotFound: "Event not found",
    ticketTypeNotFound: "Ticket type not found",
    publicIdGenerationFailed: "Could not generate publicId",
  },

  checkout: {
    invalidItems: "Invalid items",
    invalidTicketTypes: "One or more ticket types are invalid",
    mixedCurrenciesNotSupported: "Mixed currencies are not supported",
    invalidTicketTypesGeneric: "Invalid ticket types",
    notEnoughStockFor: (ticketTypeName: string) => `Not enough stock for ${ticketTypeName}`,
  },

  payment: {
    paymentInitializationFailed: "Could not initialize payment session",
    stripeNotConfigured: "Stripe is not configured",
    stripeWebhookSecretNotConfigured: "Stripe webhook secret is not configured",
    invalidStripeSignature: "Invalid Stripe signature",
  },

  uploads: {
    fileRequired: "file is required",
    onlyImageUploadsSupported: "Only image uploads are supported",
    cloudinaryUploadFailed: "Cloudinary upload failed",
    cloudinaryNotConfigured: "Cloudinary is not configured",
    invalidValue: "Invalid value",
    invalidContext: "Invalid context",
  },
} as const
