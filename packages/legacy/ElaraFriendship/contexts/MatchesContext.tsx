import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const IS_DEMO = true;

export interface MeetingPreferences {
  prefersDaytime: boolean;
  prefersGroupFirst: boolean;
  okayOneToOneFirst: boolean;
}

export type ConnectionIntent = 
  | "first-coffee"
  | "walk"
  | "study-session"
  | "event-buddy";

export const CONNECTION_INTENT_LABELS: Record<ConnectionIntent, { label: string; icon: string; description: string }> = {
  "first-coffee": { label: "Cafe para nos conhecermos", icon: "coffee", description: "Um cafe tranquilo para conversar" },
  "walk": { label: "Caminhada ao fim da tarde", icon: "sun", description: "Passeio ao ar livre" },
  "study-session": { label: "Estudar/trabalhar juntas", icon: "book-open", description: "Sessao de estudo ou cowork" },
  "event-buddy": { label: "Ir a um evento/workshop", icon: "calendar", description: "Companhia para um evento" },
};

export interface InviteDetails {
  intent: ConnectionIntent;
  proposedDate?: string;
  proposedLocationDescription?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface UserMatch {
  id: string;
  name: string;
  age: number;
  bio: string;
  photoUrl: string | null;
  values: string[];
  hobbies: string[];
  lifestyle: string[];
  compatibilityScore: number;
  distance?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  isLocationSharing?: boolean;
  intent?: string;
  socialEnergy?: string;
  meetingPreferences?: MeetingPreferences;
  boundaries?: string[];
  frequencyPreference?: string;
  phaseOfLife?: string;
  reliabilityScore?: number;
  completedMeetupsCount?: number;
  isVerified?: boolean;
  lastActive?: string;
  engagementScore?: number;
}

export type SafetyFlag = "ok" | "incomodo" | "alerta" | null;

export interface MeetupTracking {
  isActive: boolean;
  startedAt: string;
  location?: string;
  sharedWith: string[];
}

export interface Connection {
  id: string;
  matchId: string;
  match: UserMatch;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  status: "pending" | "accepted" | "declined";
  safetyFlag?: SafetyFlag;
  lastMeetup?: string;
  meetupTracking?: MeetupTracking;
  meetupCount?: number;
  invite?: InviteDetails;
  messageCount?: number;
}

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface WalkParticipant {
  id: string;
  name: string;
  photoUrl: string | null;
  isVerified: boolean;
  joinedAt: string;
}

export type WalkTag =
  | "introvertidas"
  | "extrovertidas"
  | "ambivertidas"
  | "pet-friendly"
  | "sem-alcool"
  | "manha"
  | "fim-de-semana"
  | "after-work"
  | "yoga"
  | "passeio-leve"
  | "maes"
  | "explorar"
  | "exercicio";

export interface WalkRequest {
  id: string;
  hostId: string;
  hostName: string;
  hostPhoto: string | null;
  hostIsVerified: boolean;
  startLocation: string;
  endLocation: string;
  scheduledTime: string;
  durationMinutes?: number;
  distanceFromUserKm?: number;
  participantsCount: number;
  maxParticipants: number;
  participants: WalkParticipant[];
  status: "open" | "full" | "started" | "completed" | "cancelled";
  verifiedOnly: boolean;
  shareWithEmergencyContacts: boolean;
  safetyNote?: string;
  walkType: "casual" | "exercise" | "commute" | "exploration";
  createdAt?: string;
  expiresAt?: string;
  tags?: WalkTag[];
  hostTrustScore?: number;
  hostCompletedMeetups?: number;
}

export type ElaraEventType =
  | "VIEW_PROFILE"
  | "SKIP_MATCH"
  | "SEND_MESSAGE"
  | "SEND_CONNECTION_REQUEST"
  | "ACCEPT_INVITE"
  | "CREATE_WALK"
  | "JOIN_WALK"
  | "COMPLETE_SAFETY_CHECK"
  | "ADD_EMERGENCY_CONTACT"
  | "PROFILE_COMPLETE"
  | "FIRST_MEETUP"
  | "SEND_INVITE";

export interface ElaraEvent {
  id: string;
  type: ElaraEventType;
  userId: string;
  targetId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export type HomeHighlightType = 
  | "walk-suggestion" 
  | "new-matches" 
  | "weekly-challenge" 
  | "micro-club";

export interface HomeHighlight {
  id: string;
  type: HomeHighlightType;
  title: string;
  subtitle: string;
  actionLabel: string;
  data?: unknown;
  icon: string;
}

interface MatchesContextType {
  potentialMatches: UserMatch[];
  connections: Connection[];
  messages: Record<string, Message[]>;
  walks: WalkRequest[];
  userLocation: UserLocation | null;
  isLocationSharing: boolean;
  nearbyUsers: UserMatch[];
  events: ElaraEvent[];
  addMatch: (match: UserMatch) => void;
  removeMatch: (matchId: string) => void;
  sendConnectionRequest: (matchId: string) => void;
  acceptConnection: (connectionId: string) => void;
  declineConnection: (connectionId: string) => void;
  sendMessage: (connectionId: string, text: string, senderId: string) => void;
  createWalk: (walk: Omit<WalkRequest, "id">) => void;
  joinWalk: (walkId: string, participant?: WalkParticipant) => void;
  refreshMatches: () => void;
  setUserLocation: (location: UserLocation | null) => void;
  setLocationSharing: (sharing: boolean) => void;
  refreshNearbyUsers: () => void;
  startMeetupTracking: (connectionId: string, location: string, sharedWith: string[]) => void;
  endMeetupTracking: (connectionId: string) => void;
  setSafetyFlag: (connectionId: string, flag: SafetyFlag, userId?: string) => void;
  getConnectionById: (connectionId: string) => Connection | undefined;
  sendInvite: (connectionId: string, intent: ConnectionIntent, proposedDate?: string, proposedLocation?: string) => void;
  acceptInvite: (connectionId: string) => void;
  declineInvite: (connectionId: string) => void;
  canSendMoreMessages: (connectionId: string) => boolean;
  trackEvent: (type: ElaraEventType, userId: string, targetId?: string, metadata?: Record<string, unknown>) => void;
  getHomeHighlights: (userId: string, userValues?: string[], userPhaseOfLife?: string) => HomeHighlight[];
  rankMatchesByEngagement: (userId: string) => UserMatch[];
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

const MATCHES_KEY = "@elara_matches";
const CONNECTIONS_KEY = "@elara_connections";
const MESSAGES_KEY = "@elara_messages";
const WALKS_KEY = "@elara_walks";
const LOCATION_SHARING_KEY = "@elara_location_sharing";
const USER_LOCATION_KEY = "@elara_user_location";
const EVENTS_KEY = "@elara_events";
const MAX_EVENTS_STORED = 100;

const LISBON_CENTER = { latitude: 38.7223, longitude: -9.1393 };

const DEMO_MATCHES: UserMatch[] = [
  {
    id: "1",
    name: "Sofia",
    age: 28,
    bio: "Apaixonada por yoga, livros e cafes acolhedores. Procuro amigas para explorar a cidade e partilhar bons momentos.",
    photoUrl: null,
    values: ["Autenticidade", "Crescimento Pessoal", "Empatia"],
    hobbies: ["Yoga", "Leitura", "Fotografia"],
    lifestyle: ["Saudavel", "Calma", "Aventureira"],
    compatibilityScore: 92,
    distance: 1.2,
    location: {
      latitude: LISBON_CENTER.latitude + 0.008,
      longitude: LISBON_CENTER.longitude - 0.005,
    },
    isLocationSharing: true,
    intent: "Fazer novas amigas",
    socialEnergy: "Ambivertida",
    meetingPreferences: { prefersDaytime: true, prefersGroupFirst: true, okayOneToOneFirst: false },
    boundaries: ["Prefiro mensagens primeiro", "Preciso conhecer em grupo"],
    frequencyPreference: "Semanal",
    phaseOfLife: "Recem-chegada a cidade",
    reliabilityScore: 95,
    completedMeetupsCount: 12,
    isVerified: true,
  },
  {
    id: "2",
    name: "Carolina",
    age: 31,
    bio: "Mae de dois, empreendedora e amante da natureza. Adoro caminhadas e encontros ao ar livre.",
    photoUrl: null,
    values: ["Familia", "Sustentabilidade", "Comunidade"],
    hobbies: ["Caminhadas", "Jardinagem", "Culinaria"],
    lifestyle: ["Ativa", "Consciente", "Social"],
    compatibilityScore: 87,
    distance: 2.5,
    location: {
      latitude: LISBON_CENTER.latitude - 0.012,
      longitude: LISBON_CENTER.longitude + 0.008,
    },
    isLocationSharing: true,
    intent: "Rede de apoio",
    socialEnergy: "Extrovertida",
    meetingPreferences: { prefersDaytime: true, prefersGroupFirst: false, okayOneToOneFirst: true },
    boundaries: [],
    frequencyPreference: "Semanal",
    phaseOfLife: "Mae recente",
    reliabilityScore: 88,
    completedMeetupsCount: 8,
    isVerified: true,
  },
  {
    id: "3",
    name: "Beatriz",
    age: 25,
    bio: "Designer grafica e artista nas horas vagas. Amo museus, exposicoes e conversas profundas.",
    photoUrl: null,
    values: ["Criatividade", "Liberdade", "Honestidade"],
    hobbies: ["Arte", "Museus", "Cinema"],
    lifestyle: ["Criativa", "Urbana", "Noturna"],
    compatibilityScore: 84,
    distance: 0.8,
    location: {
      latitude: LISBON_CENTER.latitude + 0.004,
      longitude: LISBON_CENTER.longitude + 0.012,
    },
    isLocationSharing: true,
    intent: "Encontrar companhia para eventos",
    socialEnergy: "Introvertida",
    meetingPreferences: { prefersDaytime: false, prefersGroupFirst: true, okayOneToOneFirst: false },
    boundaries: ["Prefiro mensagens primeiro", "Sem pressao para responder rapido"],
    frequencyPreference: "Mensal",
    phaseOfLife: "Focada na carreira",
    reliabilityScore: 72,
    completedMeetupsCount: 3,
    isVerified: false,
  },
  {
    id: "4",
    name: "Mariana",
    age: 29,
    bio: "Professora de danca e entusiasta de viagens. Sempre em busca de novas experiencias e conexoes genuinas.",
    photoUrl: null,
    values: ["Aventura", "Alegria", "Conexao"],
    hobbies: ["Danca", "Viagens", "Musica"],
    lifestyle: ["Energetica", "Espontanea", "Sociavel"],
    compatibilityScore: 89,
    distance: 3.1,
    location: {
      latitude: LISBON_CENTER.latitude - 0.006,
      longitude: LISBON_CENTER.longitude - 0.015,
    },
    isLocationSharing: true,
    intent: "Fazer novas amigas",
    socialEnergy: "Extrovertida",
    meetingPreferences: { prefersDaytime: false, prefersGroupFirst: false, okayOneToOneFirst: true },
    boundaries: [],
    frequencyPreference: "Diario",
    phaseOfLife: "Explorando novas paixoes",
    reliabilityScore: 91,
    completedMeetupsCount: 15,
    isVerified: true,
  },
  {
    id: "5",
    name: "Ana",
    age: 27,
    bio: "Enfermeira com coracao grande. Nas horas livres, cozinho, faco voluntariado e passeio com minha cadela Luna.",
    photoUrl: null,
    values: ["Compaixao", "Servico", "Gratidao"],
    hobbies: ["Culinaria", "Voluntariado", "Animais"],
    lifestyle: ["Cuidadora", "Equilibrada", "Amorosa"],
    compatibilityScore: 91,
    distance: 1.8,
    location: {
      latitude: LISBON_CENTER.latitude + 0.015,
      longitude: LISBON_CENTER.longitude + 0.003,
    },
    isLocationSharing: true,
    intent: "Rede de apoio",
    socialEnergy: "Ambivertida",
    meetingPreferences: { prefersDaytime: true, prefersGroupFirst: true, okayOneToOneFirst: true },
    boundaries: ["Preciso conhecer em grupo"],
    frequencyPreference: "Flexivel",
    phaseOfLife: "Equilibrando trabalho e vida",
    reliabilityScore: 85,
    completedMeetupsCount: 6,
    isVerified: true,
  },
];

const DEMO_CONNECTIONS: Connection[] = [
  {
    id: "conn_demo_1",
    matchId: "1",
    match: {
      id: "1",
      name: "Sofia",
      age: 28,
      bio: "Apaixonada por yoga, livros e cafes acolhedores.",
      photoUrl: null,
      values: ["Autenticidade", "Crescimento Pessoal", "Empatia"],
      hobbies: ["Yoga", "Leitura", "Fotografia"],
      lifestyle: ["Saudavel", "Calma", "Aventureira"],
      compatibilityScore: 92,
      distance: 1.2,
      reliabilityScore: 95,
      completedMeetupsCount: 12,
      isVerified: true,
    },
    lastMessage: "Ola! Gostei muito do teu perfil.",
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 1,
    status: "accepted",
    messageCount: 3,
  },
  {
    id: "conn_demo_2",
    matchId: "2",
    match: {
      id: "2",
      name: "Carolina",
      age: 31,
      bio: "Mae de dois, empreendedora e amante da natureza.",
      photoUrl: null,
      values: ["Familia", "Sustentabilidade", "Comunidade"],
      hobbies: ["Caminhadas", "Jardinagem", "Culinaria"],
      lifestyle: ["Ativa", "Consciente", "Social"],
      compatibilityScore: 87,
      distance: 2.5,
      reliabilityScore: 88,
      completedMeetupsCount: 8,
      isVerified: true,
    },
    lastMessage: "Vamos marcar um cafe?",
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
    status: "accepted",
    messageCount: 5,
    invite: {
      intent: "first-coffee",
      proposedDate: new Date(Date.now() + 172800000).toISOString(),
      proposedLocationDescription: "Fabrica Coffee Roasters, Chiado",
      status: "pending",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  },
];

const DEMO_MESSAGES: Record<string, Message[]> = {
  conn_demo_1: [
    {
      id: "msg_demo_1",
      connectionId: "conn_demo_1",
      senderId: "1",
      text: "Ola! Gostei muito do teu perfil. Tambem adoro yoga!",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  conn_demo_2: [
    {
      id: "msg_demo_2",
      connectionId: "conn_demo_2",
      senderId: "2",
      text: "Ola! Vi que tambem tens interesse em caminhadas.",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "msg_demo_3",
      connectionId: "conn_demo_2",
      senderId: "current_user",
      text: "Sim! Adoro fazer caminhadas ao fim de semana.",
      timestamp: new Date(Date.now() - 90000000).toISOString(),
    },
    {
      id: "msg_demo_4",
      connectionId: "conn_demo_2",
      senderId: "2",
      text: "Vamos marcar um cafe?",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

const DEMO_WALKS: WalkRequest[] = [
  {
    id: "w1",
    hostId: "user_1",
    hostName: "Sofia",
    hostPhoto: null,
    hostIsVerified: true,
    startLocation: "Parque das Nações",
    endLocation: "Centro Comercial Vasco da Gama",
    scheduledTime: new Date(Date.now() + 3600000).toISOString(),
    participantsCount: 2,
    maxParticipants: 4,
    participants: [
      { id: "wp_1_host", name: "Sofia", photoUrl: null, isVerified: true, joinedAt: new Date().toISOString() },
      { id: "wp_1_guest1", name: "Maria", photoUrl: null, isVerified: true, joinedAt: new Date().toISOString() },
    ],
    status: "open",
    verifiedOnly: true,
    shareWithEmergencyContacts: true,
    walkType: "casual",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    tags: ["ambivertidas", "yoga", "passeio-leve"],
    hostTrustScore: 95,
    hostCompletedMeetups: 12,
    distanceFromUserKm: 1.2,
    durationMinutes: 45,
  },
  {
    id: "w2",
    hostId: "user_2",
    hostName: "Carolina",
    hostPhoto: null,
    hostIsVerified: true,
    startLocation: "Praça do Comércio",
    endLocation: "Alfama",
    scheduledTime: new Date(Date.now() + 7200000).toISOString(),
    participantsCount: 1,
    maxParticipants: 3,
    participants: [
      { id: "wp_2_host", name: "Carolina", photoUrl: null, isVerified: true, joinedAt: new Date().toISOString() },
    ],
    status: "open",
    verifiedOnly: true,
    shareWithEmergencyContacts: true,
    safetyNote: "Vou estar com casaco azul marinho",
    walkType: "exploration",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    tags: ["maes", "explorar", "after-work"],
    hostTrustScore: 88,
    hostCompletedMeetups: 8,
    distanceFromUserKm: 2.5,
    durationMinutes: 60,
  },
  {
    id: "w3",
    hostId: "user_4",
    hostName: "Mariana",
    hostPhoto: null,
    hostIsVerified: true,
    startLocation: "Jardim da Estrela",
    endLocation: "Santos",
    scheduledTime: new Date(Date.now() + 10800000).toISOString(),
    participantsCount: 3,
    maxParticipants: 4,
    participants: [
      { id: "wp_3_host", name: "Mariana", photoUrl: null, isVerified: true, joinedAt: new Date().toISOString() },
      { id: "wp_3_guest1", name: "Joana", photoUrl: null, isVerified: true, joinedAt: new Date().toISOString() },
      { id: "wp_3_guest2", name: "Rita", photoUrl: null, isVerified: false, joinedAt: new Date().toISOString() },
    ],
    status: "open",
    verifiedOnly: false,
    shareWithEmergencyContacts: true,
    walkType: "exercise",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 10800000).toISOString(),
    tags: ["extrovertidas", "exercicio", "fim-de-semana"],
    hostTrustScore: 91,
    hostCompletedMeetups: 15,
    distanceFromUserKm: 3.1,
    durationMinutes: 90,
  },
];

function migrateWalk(walk: any): WalkRequest | null {
  if (!walk || typeof walk !== "object" || !walk.id || !walk.hostName) {
    return null;
  }
  
  const defaultParticipant: WalkParticipant = {
    id: walk.hostId || "unknown",
    name: walk.hostName || "Anfitria",
    photoUrl: walk.hostPhoto || null,
    isVerified: true,
    joinedAt: walk.scheduledTime || new Date().toISOString(),
  };
  
  const participants: WalkParticipant[] = Array.isArray(walk.participants) && walk.participants.length > 0
    ? walk.participants.map((p: any) => ({
        id: p?.id || `p_${Date.now()}`,
        name: p?.name || "Participante",
        photoUrl: p?.photoUrl || null,
        isVerified: p?.isVerified ?? true,
        joinedAt: p?.joinedAt || new Date().toISOString(),
      }))
    : [defaultParticipant];

  return {
    id: walk.id,
    hostId: walk.hostId || "unknown",
    hostName: walk.hostName,
    hostPhoto: walk.hostPhoto || null,
    hostIsVerified: walk.hostIsVerified ?? true,
    startLocation: walk.startLocation || "Local de encontro",
    endLocation: walk.endLocation || "Destino",
    scheduledTime: walk.scheduledTime || new Date().toISOString(),
    participantsCount: participants.length,
    maxParticipants: walk.maxParticipants || 3,
    participants,
    status: walk.status || "open",
    verifiedOnly: walk.verifiedOnly ?? true,
    shareWithEmergencyContacts: walk.shareWithEmergencyContacts ?? false,
    safetyNote: walk.safetyNote,
    walkType: walk.walkType || "casual",
  };
}

export function MatchesProvider({ children }: { children: ReactNode }) {
  const [potentialMatches, setPotentialMatches] = useState<UserMatch[]>(DEMO_MATCHES);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [walks, setWalks] = useState<WalkRequest[]>(DEMO_WALKS);
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(null);
  const [isLocationSharing, setIsLocationSharing] = useState<boolean>(false);
  const [nearbyUsers, setNearbyUsers] = useState<UserMatch[]>([]);
  const [events, setEvents] = useState<ElaraEvent[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    refreshNearbyUsers();
  }, [potentialMatches, connections, isLocationSharing]);

  const loadData = async () => {
    try {
      const [
        storedConnections,
        storedMessages,
        storedWalks,
        storedLocationSharing,
        storedUserLocation,
        storedEvents,
      ] = await Promise.all([
        AsyncStorage.getItem(CONNECTIONS_KEY),
        AsyncStorage.getItem(MESSAGES_KEY),
        AsyncStorage.getItem(WALKS_KEY),
        AsyncStorage.getItem(LOCATION_SHARING_KEY),
        AsyncStorage.getItem(USER_LOCATION_KEY),
        AsyncStorage.getItem(EVENTS_KEY),
      ]);

      if (storedConnections) {
        const parsed = JSON.parse(storedConnections);
        setConnections(parsed.length > 0 ? parsed : DEMO_CONNECTIONS);
      } else {
        setConnections(DEMO_CONNECTIONS);
      }
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        setMessages(Object.keys(parsed).length > 0 ? parsed : DEMO_MESSAGES);
      } else {
        setMessages(DEMO_MESSAGES);
      }
      if (storedWalks) {
        const parsedWalks = JSON.parse(storedWalks);
        const migratedWalks = Array.isArray(parsedWalks)
          ? parsedWalks.map(migrateWalk).filter((w): w is WalkRequest => w !== null)
          : [];
        setWalks(migratedWalks.length > 0 ? migratedWalks : DEMO_WALKS);
      }
      if (storedLocationSharing) setIsLocationSharing(JSON.parse(storedLocationSharing));
      if (storedUserLocation) setUserLocationState(JSON.parse(storedUserLocation));
      if (storedEvents) setEvents(JSON.parse(storedEvents));
    } catch (error) {
      console.error("Failed to load matches data:", error);
    }
  };

  const saveConnections = async (newConnections: Connection[]) => {
    try {
      await AsyncStorage.setItem(CONNECTIONS_KEY, JSON.stringify(newConnections));
    } catch (error) {
      console.error("Failed to save connections:", error);
    }
  };

  const saveMessages = async (newMessages: Record<string, Message[]>) => {
    try {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  };

  const saveWalks = async (newWalks: WalkRequest[]) => {
    try {
      await AsyncStorage.setItem(WALKS_KEY, JSON.stringify(newWalks));
    } catch (error) {
      console.error("Failed to save walks:", error);
    }
  };

  const saveEvents = async (newEvents: ElaraEvent[]) => {
    try {
      const trimmed = newEvents.slice(-MAX_EVENTS_STORED);
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Failed to save events:", error);
    }
  };

  const trackEvent = (
    type: ElaraEventType,
    userId: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ) => {
    const newEvent: ElaraEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      userId,
      targetId,
      timestamp: new Date().toISOString(),
      metadata,
    };
    const newEvents = [...events, newEvent];
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const getHomeHighlights = (
    userId: string,
    userValues: string[] = [],
    userPhaseOfLife?: string
  ): HomeHighlight[] => {
    const highlights: HomeHighlight[] = [];
    const now = new Date();
    
    const upcomingWalks = walks.filter(
      w => w.status === "open" && new Date(w.scheduledTime) > now
    );
    if (upcomingWalks.length > 0) {
      const randomWalk = upcomingWalks[Math.floor(Math.random() * upcomingWalks.length)];
      const spotsLeft = randomWalk.maxParticipants - randomWalk.participantsCount;
      highlights.push({
        id: `highlight_walk_${randomWalk.id}`,
        type: "walk-suggestion",
        title: "Caminhada perto de ti",
        subtitle: `${randomWalk.startLocation} - ${spotsLeft} vaga${spotsLeft > 1 ? "s" : ""}`,
        actionLabel: "Ver detalhes",
        data: randomWalk,
        icon: "map-pin",
      });
    }
    
    const compatibleMatches = potentialMatches.filter(
      m => m.values.some(v => userValues.includes(v)) || 
           (userPhaseOfLife && m.phaseOfLife === userPhaseOfLife)
    );
    if (compatibleMatches.length >= 2) {
      highlights.push({
        id: `highlight_matches_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: "new-matches",
        title: `${compatibleMatches.length} novas amigas`,
        subtitle: "com valores semelhantes aos teus",
        actionLabel: "Descobrir",
        data: compatibleMatches.slice(0, 3),
        icon: "users",
      });
    }
    
    const challenges = [
      { title: "Desafio da Semana", subtitle: "Tomar 1 cafe com alguem novo", icon: "coffee" },
      { title: "Desafio de Conexao", subtitle: "Participar numa caminhada em grupo", icon: "heart" },
      { title: "Desafio de Comunidade", subtitle: "Convidar uma amiga para o Elara", icon: "user-plus" },
    ];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    highlights.push({
      id: `highlight_challenge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: "weekly-challenge",
      title: randomChallenge.title,
      subtitle: randomChallenge.subtitle,
      actionLabel: "Aceitar",
      icon: randomChallenge.icon,
    });
    
    const phaseLabels: Record<string, string> = {
      "estudante": "Estudantes",
      "expatriada": "Expatriadas",
      "mae": "Maes",
      "recem-chegada": "Recem-Chegadas",
      "em-transicao": "Em Transicao",
    };
    if (userPhaseOfLife && phaseLabels[userPhaseOfLife]) {
      highlights.push({
        id: `highlight_club_${userPhaseOfLife}`,
        type: "micro-club",
        title: `Clube das ${phaseLabels[userPhaseOfLife]}`,
        subtitle: "Encontro marcado esta semana",
        actionLabel: "Juntar-me",
        icon: "star",
      });
    }
    
    return highlights.sort(() => Math.random() - 0.5).slice(0, 2);
  };

  const rankMatchesByEngagement = (userId: string): UserMatch[] => {
    const userEvents = events.filter(e => e.userId === userId);
    
    return [...potentialMatches]
      .map(match => {
        let score = match.compatibilityScore || 0;
        
        const viewedCount = userEvents.filter(
          e => e.type === "VIEW_PROFILE" && e.targetId === match.id
        ).length;
        score += viewedCount * 2;
        
        const skippedCount = userEvents.filter(
          e => e.type === "SKIP_MATCH" && e.targetId === match.id
        ).length;
        score -= skippedCount * 5;
        
        if (match.distance && match.distance < 3) {
          score += 5;
        }
        
        if (match.reliabilityScore && match.reliabilityScore >= 85) {
          score += 3;
        }
        
        if (match.completedMeetupsCount && match.completedMeetupsCount > 5) {
          score += 2;
        }
        
        return { ...match, engagementScore: score };
      })
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
  };

  const setUserLocation = async (location: UserLocation | null) => {
    setUserLocationState(location);
    try {
      if (location) {
        await AsyncStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
      } else {
        await AsyncStorage.removeItem(USER_LOCATION_KEY);
      }
    } catch (error) {
      console.error("Failed to save user location:", error);
    }
  };

  const setLocationSharing = async (sharing: boolean) => {
    setIsLocationSharing(sharing);
    try {
      await AsyncStorage.setItem(LOCATION_SHARING_KEY, JSON.stringify(sharing));
      if (!sharing) {
        setUserLocationState(null);
        await AsyncStorage.removeItem(USER_LOCATION_KEY);
      }
    } catch (error) {
      console.error("Failed to save location sharing:", error);
    }
  };

  const refreshNearbyUsers = () => {
    const allUsersWithLocation = [
      ...potentialMatches.filter(m => m.location && m.isLocationSharing),
      ...connections
        .filter(c => c.status === "accepted" && c.match.location && c.match.isLocationSharing)
        .map(c => c.match),
    ];
    setNearbyUsers(allUsersWithLocation);
  };

  const addMatch = (match: UserMatch) => {
    setPotentialMatches(prev => [...prev, match]);
  };

  const removeMatch = (matchId: string) => {
    setPotentialMatches(prev => prev.filter(m => m.id !== matchId));
  };

  const sendConnectionRequest = (matchId: string) => {
    const match = potentialMatches.find(m => m.id === matchId);
    if (!match) return;

    const newConnection: Connection = {
      id: `conn_${Date.now()}`,
      matchId,
      match,
      unreadCount: 0,
      status: "accepted",
    };

    const newConnections = [...connections, newConnection];
    setConnections(newConnections);
    saveConnections(newConnections);
    removeMatch(matchId);
  };

  const acceptConnection = (connectionId: string) => {
    const newConnections = connections.map(c =>
      c.id === connectionId ? { ...c, status: "accepted" as const } : c
    );
    setConnections(newConnections);
    saveConnections(newConnections);
  };

  const declineConnection = (connectionId: string) => {
    const newConnections = connections.filter(c => c.id !== connectionId);
    setConnections(newConnections);
    saveConnections(newConnections);
  };

  const sendMessage = (connectionId: string, text: string, senderId: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      connectionId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
    };

    const connectionMessages = messages[connectionId] || [];
    const newMessages = {
      ...messages,
      [connectionId]: [...connectionMessages, newMessage],
    };
    setMessages(newMessages);
    saveMessages(newMessages);

    const newConnections = connections.map(c =>
      c.id === connectionId
        ? { 
            ...c, 
            lastMessage: text, 
            lastMessageTime: newMessage.timestamp,
            messageCount: (c.messageCount || 0) + 1,
          }
        : c
    );
    setConnections(newConnections);
    saveConnections(newConnections);
    
    trackEvent("SEND_MESSAGE", senderId, connectionId);
  };

  const createWalk = (walk: Omit<WalkRequest, "id">) => {
    const newWalk: WalkRequest = {
      ...walk,
      id: `walk_${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    const newWalks = [...walks, newWalk];
    setWalks(newWalks);
    saveWalks(newWalks);
    
    trackEvent("CREATE_WALK", walk.hostId, newWalk.id);
  };

  const joinWalk = (walkId: string, participant?: WalkParticipant) => {
    const newWalks = walks.map(w => {
      if (w.id !== walkId) return w;
      const newParticipant = participant || {
        id: `participant_${Date.now()}`,
        name: "Utilizadora",
        photoUrl: null,
        isVerified: true,
        joinedAt: new Date().toISOString(),
      };
      return {
        ...w,
        participantsCount: w.participantsCount + 1,
        participants: [...w.participants, newParticipant],
        status: w.participantsCount + 1 >= w.maxParticipants ? ("full" as const) : w.status,
      };
    });
    setWalks(newWalks);
    saveWalks(newWalks);
    
    if (participant) {
      trackEvent("JOIN_WALK", participant.id, walkId);
    }
  };

  const refreshMatches = () => {
    setPotentialMatches(DEMO_MATCHES);
  };

  const getConnectionById = (connectionId: string) => {
    return connections.find(c => c.id === connectionId);
  };

  const startMeetupTracking = (connectionId: string, location: string, sharedWith: string[]) => {
    const newConnections = connections.map(c => {
      if (c.id !== connectionId) return c;
      return {
        ...c,
        meetupTracking: {
          isActive: true,
          startedAt: new Date().toISOString(),
          location,
          sharedWith,
        },
      };
    });
    setConnections(newConnections);
    saveConnections(newConnections);
  };

  const endMeetupTracking = (connectionId: string) => {
    const newConnections = connections.map(c => {
      if (c.id !== connectionId) return c;
      return {
        ...c,
        meetupTracking: undefined,
        lastMeetup: new Date().toISOString(),
        meetupCount: (c.meetupCount || 0) + 1,
      };
    });
    setConnections(newConnections);
    saveConnections(newConnections);
  };

  const setSafetyFlag = (connectionId: string, flag: SafetyFlag, userId?: string) => {
    const newConnections = connections.map(c => {
      if (c.id !== connectionId) return c;
      return { ...c, safetyFlag: flag };
    });
    setConnections(newConnections);
    saveConnections(newConnections);
    
    if (userId) {
      trackEvent("COMPLETE_SAFETY_CHECK", userId, connectionId, { safetyFlag: flag });
    }

    if (flag === "alerta" || flag === "incomodo") {
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        const newMatches = potentialMatches.map(m => {
          if (m.id === connection.matchId) {
            return { ...m, compatibilityScore: Math.max(0, m.compatibilityScore - 30) };
          }
          return m;
        });
        setPotentialMatches(newMatches);
      }
    }
  };

  const sendInvite = (connectionId: string, intent: ConnectionIntent, proposedDate?: string, proposedLocation?: string) => {
    const newConnections = connections.map(c => {
      if (c.id !== connectionId) return c;
      return {
        ...c,
        invite: {
          intent,
          proposedDate,
          proposedLocationDescription: proposedLocation,
          status: "pending" as const,
          createdAt: new Date().toISOString(),
        },
      };
    });
    setConnections(newConnections);
    saveConnections(newConnections);
  };

  const acceptInvite = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    const newConnections = connections.map(c => {
      if (c.id !== connectionId || !c.invite) return c;
      return {
        ...c,
        invite: { ...c.invite, status: "accepted" as const },
      };
    });
    setConnections(newConnections);
    saveConnections(newConnections);
    
    if (connection) {
      trackEvent("ACCEPT_INVITE", connection.matchId, connectionId, { intent: connection.invite?.intent });
    }
  };

  const declineInvite = (connectionId: string) => {
    const newConnections = connections.map(c => {
      if (c.id !== connectionId) return c;
      return {
        ...c,
        invite: undefined,
      };
    });
    setConnections(newConnections);
    saveConnections(newConnections);
  };

  const MESSAGE_LIMIT_BEFORE_INVITE = 10;
  const canSendMoreMessages = (connectionId: string): boolean => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return false;
    if (connection.invite?.status === "accepted") return true;
    const msgCount = connection.messageCount || 0;
    return msgCount < MESSAGE_LIMIT_BEFORE_INVITE;
  };

  return (
    <MatchesContext.Provider
      value={{
        potentialMatches,
        connections,
        messages,
        walks,
        userLocation,
        isLocationSharing,
        nearbyUsers,
        events,
        addMatch,
        removeMatch,
        sendConnectionRequest,
        acceptConnection,
        declineConnection,
        sendMessage,
        createWalk,
        joinWalk,
        refreshMatches,
        setUserLocation,
        setLocationSharing,
        refreshNearbyUsers,
        startMeetupTracking,
        endMeetupTracking,
        setSafetyFlag,
        getConnectionById,
        sendInvite,
        acceptInvite,
        declineInvite,
        canSendMoreMessages,
        trackEvent,
        getHomeHighlights,
        rankMatchesByEngagement,
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error("useMatches must be used within a MatchesProvider");
  }
  return context;
}
