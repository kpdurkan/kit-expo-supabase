
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, H2, Input } from '../components/ui';
import { COLORS } from '../theme';
import { supabase } from '../lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Venue = { id:string; name:string };
type EventT = { id:string; title:string; date:string; venue_id:string; notes?:string|null };

async function fetchEvents(): Promise<EventT[]> {
  const { data, error } = await supabase.from('events').select('*').order('date');
  if (error) throw error;
  return data as EventT[];
}
async function fetchVenues(): Promise<Venue[]> {
  const { data, error } = await supabase.from('venues').select('*').order('name');
  if (error) throw error;
  return data as Venue[];
}

export const EventsScreen: React.FC = () => {
  const qc = useQueryClient();
  const { data: events=[] } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
  const { data: venues=[] } = useQuery({ queryKey: ['venues'], queryFn: fetchVenues });

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venueId, setVenueId] = useState('');
  const [notes, setNotes] = useState('');

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('events').insert({ title, date, venue_id: venueId, notes: notes||null });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setTitle(''); setDate(''); setVenueId(''); setNotes(''); },
  });

  const del = useMutation({
    mutationFn: async (id:string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });

  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.bg, padding:16 }}>
      <H2>Add Event</H2>
      <Card>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          <Input value={title} onChangeText={setTitle} placeholder="Event title" />
          <Input value={date} onChangeText={setDate} placeholder="Date (YYYY-MM-DD)" />
          <Input value={venueId} onChangeText={setVenueId} placeholder="Venue ID (pick below)" />
          <Input value={notes} onChangeText={setNotes} placeholder="Notes (optional)" />
          <Button title={add.isPending ? 'Saving...' : 'Save'} onPress={()=> title.trim() && date.trim() && venueId.trim() && add.mutate()} />
        </View>
      </Card>

      <H2>Events</H2>
      {events.map(e => (
        <Card key={e.id}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <View>
              <Text style={{ fontWeight:'700' }}>{e.title}</Text>
              <Text>{new Date(e.date).toDateString()}</Text>
              <Text style={{ color:'#6b7280' }}>Venue: {e.venue_id}</Text>
              {e.notes ? <Text>{e.notes}</Text> : null}
            </View>
            <Button kind="secondary" title="Delete" onPress={()=>del.mutate(e.id)} />
          </View>
        </Card>
      ))}

      <H2>Venues (tap ID to fill)</H2>
      {venues.map(v => (
        <Card key={v.id}>
          <Text style={{ color: COLORS.navy }} onPress={()=>setVenueId(v.id)} selectable>{v.name} — {v.id}</Text>
        </Card>
      ))}
    </ScrollView>
  );
};
