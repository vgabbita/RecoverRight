import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Get the user to check their role
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user exists in our users table
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role) {
        // Redirect to role-specific dashboard
        return NextResponse.redirect(`${origin}/${userData.role}`);
      } else {
        // User authenticated but no role set - redirect to role selection or signup
        return NextResponse.redirect(`${origin}/signup?step=1&email=${encodeURIComponent(user.email || '')}`);
      }
    }
  }

  // If no code or user, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}

