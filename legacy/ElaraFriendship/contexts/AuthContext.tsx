import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Intent = "novas-amigas" | "rede-apoio" | "networking" | "atividades" | "tudo";
export type SocialEnergy = "introvertida" | "ambivertida" | "extrovertida";
export type FrequencyPreference = "ocasional" | "semanal" | "quase-diaria";
export type PhaseOfLife = "estudante" | "recem-chegada" | "mae" | "expatriada" | "em-transicao" | "profissional" | "outro";
export type VerificationStatus = "unverified" | "pending" | "verified";

export interface MeetingPreferences {
  prefersDaytime: boolean;
  prefersGroupFirst: boolean;
  okayOneToOneFirst: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photoUrl: string | null;
  values: string[];
  hobbies: string[];
  lifestyle: string[];
  emergencyContacts: EmergencyContact[];
  locationEnabled: boolean;
  dataSharingEnabled: boolean;
  profileHidden: boolean;
  isProfileComplete: boolean;
  intent?: Intent[];
  socialEnergy?: SocialEnergy;
  meetingPreferences?: MeetingPreferences;
  boundaries?: string[];
  frequencyPreference?: FrequencyPreference;
  phaseOfLife?: PhaseOfLife;
  onboardingStep?: number;
  trustScore?: number;
  meetupsCompleted?: number;
  safetyChecksCompleted?: number;
  verificationStatus?: VerificationStatus;
  verificationPhotoUrl?: string | null;
  verificationDate?: string | null;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "@elara_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setUser(profile);
    } catch (error) {
      console.error("Failed to sign in:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
