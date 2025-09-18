
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlayersScreen } from './src/screens/PlayersScreen';
import { VenuesScreen } from './src/screens/VenuesScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { SocialScreen } from './src/screens/SocialScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { supabase } from './src/lib/supabase';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const qc = new QueryClient();

function Tabs() {
  const logo = require('./assets/icon.png');
  return (
    <Tab.Navigator screenOptions={{ headerShown:false }}>
      <Tab.Screen name="Home" children={()=>(<HomeScreen logo={logo} events={[]} venues={[]} />)} />
      <Tab.Screen name="Players" component={PlayersScreen} />
      <Tab.Screen name="Venues" component={VenuesScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = React.useState<any>(null);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown:false }}>
            {session ? (
              <Stack.Screen name="Main" component={Tabs} />
            ) : (
              <Stack.Screen name="Auth" component={AuthScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
