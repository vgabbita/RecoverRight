'use client';

import { useState } from 'react';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Stethoscope, Clipboard } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelector({ selectedRole, onRoleSelect }: RoleSelectorProps) {
  const roles = [
    {
      value: 'player' as UserRole,
      label: 'Player',
      description: 'Track your daily recovery and receive personalized guidance',
      icon: Users,
    },
    {
      value: 'physician' as UserRole,
      label: 'Physician',
      description: 'Monitor player health and provide medical support',
      icon: Stethoscope,
    },
    {
      value: 'coach' as UserRole,
      label: 'Coach',
      description: 'View team readiness and make informed lineup decisions',
      icon: Clipboard,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-text-primary">Select Your Role</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.value;
          
          return (
            <Card
              key={role.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-primary ring-2 ring-primary' : ''
              }`}
              onClick={() => onRoleSelect(role.value)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-text-secondary'}`} />
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <CardTitle className="text-lg">{role.label}</CardTitle>
                <CardDescription className="text-sm">
                  {role.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
