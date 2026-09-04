// eslint-disable-next-line import-x/no-rename-default

import { IconType } from "react-icons";
import {
  MdEventNote,
  MdOutlineAssignment,
  MdOutlineConfirmationNumber,
  MdOutlineFavoriteBorder,
  MdOutlineShoppingCart,
  MdOutlineStorefront,
  MdOutlineWallet,
} from "react-icons/md";
import { PiChartLineUp, PiGear } from "react-icons/pi";
const HTTP_STATUSES = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ACCEPTABLE: 406,
  PAYLOAD_LARGE: 413,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

const ERRORS = {
  UNKNOWN_ERROR: "Une erreur est survenue, veuillez réessayer plus tard !",
  TECHNICAL_ERROR:
    "Ce n'est pas vous. C'est nous. Veuillez réessayer, s'il vous plaît !",
  FORBIDDEN_ERROR: "Vous n'avez pas la permission d'effectuer cette action",
  UNAUTHORIZED_ERROR:
    "Vous n'êtes pas connecté ! Veuillez vous connecter pour y accéder",
  TOKEN_USER_NOT_EXIST_ERROR: "L'utilisateur associé à ce jeton n'existe plus",
  INVALID_USER_TOKEN_ERROR:
    "Jeton utilisateur invalide. Veuillez vous reconnecter !",
  USER_TOKEN_EXPIRED_ERROR: "Votre jeton a expiré. Veuillez vous reconnecter !",
  RATE_LIMIT_ERROR:
    "Trop de requêtes depuis cette IP, veuillez réessayer dans une heure !",
  MAINTENANCE_ERROR:
    "Ce site est actuellement incapable de traiter la requête en raison d'une maintenance du serveur. Veuillez réessayer plus tard",
  JSON_PARSE_ERROR: "JSON invalide",
  CORS_ERROR:
    "CORS non activé pour ce site, veuillez contacter votre administrateur.",
  CONNECTION_ERROR:
    "Nous rencontrons actuellement des problèmes de connexion à la base de données. Veuillez réessayer plus tard.",
} as const;

const MESSAGES = {
  INVALID_DATA: "Les données fournies sont invalides",
  NO_DATA_FOUND: "Aucune donnée trouvée",
  ID_NOT_FOUND: "Aucune donnée trouvée avec cet identifiant",
  ALREADY_EXIST: "Existe déjà",
  LOGIN_MESSAGE: "Connexion réussie",
  LOGOUT_MESSAGE: "Déconnexion réussie",
  PROFILE_RETRIEVED: "Profil récupéré avec succès",
  INCORRECT_LOGIN: "Adresse e-mail ou mot de passe incorrect",
  USERS_RETRIEVED: "Utilisateurs récupérés avec succès.",
} as const;

const COOKIES = {
  TOKEN_NAME: "access_token",
  THEME_NAME: "light",
};

type NavItems = {
  label: string;
  icon: IconType;
  href: string;
};

const NAV_LINKS: NavItems[] = [
  { label: "Statistiques", icon: PiChartLineUp, href: "/admin/dashboard" },
  { label: "Evenements", icon: MdEventNote, href: "/admin/events" },
  { label: "Ventes", icon: MdOutlineConfirmationNumber, href: "/admin/orders" },
  { label: "Mon compte", icon: PiGear, href: "/admin/settings" },
];

const SUB_ROUTES = [
  {
    pattern: /^\/admin\/orders\/[^/]+$/,
    label: "Détail commande",
    parentHref: "/admin/orders",
  },
  {
    pattern: /^\/admin\/clients\/[^/]+$/,
    label: "Détail client",
    parentHref: "/admin/clients",
  },
];

const MOBILE_NAV_LINKS: NavItems[] = [
  { label: "Catalogue", icon: MdOutlineStorefront, href: "/" },
  { label: "Panier", icon: MdOutlineShoppingCart, href: "/cart" },
  { label: "Commandes", icon: MdOutlineAssignment, href: "/orders" },
  { label: "Favoris", icon: MdOutlineFavoriteBorder, href: "/favorites" },
];

const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/glass/svg?seed=";

const constants = {
  SUB_ROUTES,
  NAV_LINKS,
  MOBILE_NAV_LINKS,
  HTTP_STATUSES,
  ERRORS,
  MESSAGES,
  COOKIES,
  DICEBEAR_BASE_URL,
} as const;

export default constants;

export const META_DATA = {
  title: "EventEase | Landing Page",
  description:
    "EventEase aide les organisateurs a lancer, vendre et piloter leurs evenements publics.",
} as const ;
