
import React from 'react';
import { View, Image, Text, ScrollView } from 'react-native';
import { Card, H1, H2 } from '../components/ui';
import { COLORS } from '../theme';

type Venue = { id: string; name: string };
type EventT = { id: string; title: string; date: string; venue_id: string };

export const HomeScreen: React.FC<{ logo: any; events: EventT[]; venues: Venue[] }> = ({ logo, events, venues }) => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg, padding: 16 }}>
      <Card>
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          {logo ? <Image source={logo} style={{ width: 72, height: 72, borderRadius: 12, marginRight: 12 }} resizeMode="contain" /> : null}
          <View>
            <H1>Kevin Durkan Trophy</H1>
            <Text style={{ color: '#6b7280' }}>Manage your weekend below.</Text>
          </View>
        </View>
      </Card>

      <H2>Upcoming Rounds</H2>
      {events.length===0 ? <Text style={{ color:'#6b7280' }}>No events yet.</Text> : null}
      {events.map(e => (
        <Card key={e.id}>
          <Text style={{ fontWeight: '700' }}>{e.title}</Text>
          <Text>{new Date(e.date).toDateString()}</Text>
          <Text>{venues.find(v=>v.id===e.venue_id)?.name || 'Unknown venue'}</Text>
        </Card>
      ))}
    </ScrollView>
  );
};
