
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, H2, Input } from '../components/ui';
import { COLORS } from '../theme';
import { supabase } from '../lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Social = { id:string; kind:'hotel'|'restaurant'|'bar'|'other'; name:string; date?:string|null; address?:string|null; details?:string|null };

async function fetchSocial(): Promise<Social[]> {
  const { data, error } = await supabase.from('social_items').select('*').order('date');
  if (error) throw error;
  return data as Social[];
}

export const SocialScreen: React.FC = () => {
  const qc = useQueryClient();
  const { data: items=[] } = useQuery({ queryKey: ['social'], queryFn: fetchSocial });

  const [kind, setKind] = useState('hotel');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('social_items').insert({ kind, name, date: date||null, address: address||null, details: details||null });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social'] }); setName(''); setDate(''); setAddress(''); setDetails(''); },
  });
  const del = useMutation({
    mutationFn: async (id:string) => {
      const { error } = await supabase.from('social_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social'] }),
  });

  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.bg, padding:16 }}>
      <H2>Add Social Item</H2>
      <Card>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          <Input value={kind} onChangeText={setKind} placeholder="Kind (hotel/restaurant/bar/other)" />
          <Input value={name} onChangeText={setName} placeholder="Name" />
          <Input value={date} onChangeText={setDate} placeholder="ISO date/time" />
          <Input value={address} onChangeText={setAddress} placeholder="Address" />
          <Input value={details} onChangeText={setDetails} placeholder="Details" />
          <Button title={add.isPending ? 'Saving...' : 'Save'} onPress={()=> name.trim() && add.mutate()} />
        </View>
      </Card>

      <H2>Plan</H2>
      {items.map(it => (
        <Card key={it.id}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <View>
              <Text style={{ fontWeight:'700' }}>{it.kind.toUpperCase()}</Text>
              <Text>{it.name}</Text>
              {it.date ? <Text>{new Date(it.date).toLocaleString()}</Text> : null}
              {it.address ? <Text>{it.address}</Text> : null}
              {it.details ? <Text>{it.details}</Text> : null}
            </View>
            <Button kind="secondary" title="Delete" onPress={()=>del.mutate(it.id)} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};
