export type UserRole = 'player' | 'physician' | 'coach';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Profile {
  user_id: string;
  full_name: string;
  age: number;
  team_id?: number;
}

export interface PlayerProfile extends Profile {
  user_id: string;
}

export interface PhysicianProfile extends Profile {
  user_id: string;
}

export interface CoachProfile extends Profile {
  user_id: string;
}
