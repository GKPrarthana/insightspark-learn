import { useUser, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ClerkAuthDebug() {
  const { user, isLoaded } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const testTokens = async () => {
    console.log('🧪 Testing Clerk tokens...');
    
    try {
      // Test Supabase template token
      const supabaseToken = await getToken({ template: 'supabase' });
      console.log('Supabase template token:', supabaseToken ? '✅ Available' : '❌ Not available');
      if (supabaseToken) {
        console.log('Supabase token preview:', supabaseToken.substring(0, 50) + '...');
        
        try {
          const payload = JSON.parse(atob(supabaseToken.split('.')[1]));
          console.log('Supabase token payload:', payload);
        } catch (e) {
          console.error('Failed to decode Supabase token:', e);
        }
      }
      
      // Test default token
      const defaultToken = await getToken();
      console.log('Default token:', defaultToken ? '✅ Available' : '❌ Not available');
      if (defaultToken) {
        console.log('Default token preview:', defaultToken.substring(0, 50) + '...');
        
        try {
          const payload = JSON.parse(atob(defaultToken.split('.')[1]));
          console.log('Default token payload:', payload);
        } catch (e) {
          console.error('Failed to decode default token:', e);
        }
      }
    } catch (error) {
      console.error('Token test error:', error);
    }
  };

  if (!isLoaded) {
    return <div>Loading auth state...</div>;
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Clerk Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>Auth Status:</span>
            <Badge variant={isSignedIn ? "default" : "destructive"}>
              {isSignedIn ? 'Signed In' : 'Not Signed In'}
            </Badge>
          </div>
          
          {user && (
            <div className="space-y-1 text-sm">
              <div><strong>User ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</div>
              <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
              <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</div>
            </div>
          )}
          
          <Button onClick={testTokens} variant="outline">
            Test Tokens (Check Console)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}