
import React, { useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Button, Card, H2, Input } from '../components/ui';
import { COLORS } from '../theme';
import { supabase } from '../lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Venue = { id:string; name:string; address?:string|null; phone?:string|null; website?:string|null };

async function fetchVenues(): Promise<Venue[]> {
  const { data, error } = await supabase.from('venues').select('*').order('name');
  if (error) throw error;
  return data as Venue[];
}

export const VenuesScreen: React.FC = () => {
  const qc = useQueryClient();
  const { data: venues=[] } = useQuery({ queryKey: ['venues'], queryFn: fetchVenues });

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('venues').insert({ name, address: address||null, phone: phone||null, website: website||null });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['venues'] }); setName(''); setAddress(''); setPhone(''); setWebsite(''); },
  });

  const del = useMutation({
    mutationFn: async (id:string) => {
      const { error } = await supabase.from('venues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venues'] }),
  });

  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.bg, padding:16 }}>
      <H2>Add Venue</H2>
      <Card>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          <Input value={name} onChangeText={setName} placeholder="Venue name" />
          <Input value={address} onChangeText={setAddress} placeholder="Address" />
          <Input value={phone} onChangeText={setPhone} placeholder="Phone" />
          <Input value={website} onChangeText={setWebsite} placeholder="Website" />
          <Button title={add.isPending ? 'Saving...' : 'Save'} onPress={()=> name.trim() && add.mutate()} />
        </View>
      </Card>

      <H2>Venues (tap to copy ID into Events)</H2>
      {venues.map(v => (
        <Card key={v.id}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <View>
              <Text style={{ fontWeight:'700' }}>{v.name}</Text>
              {v.address ? <Text>{v.address}</Text> : null}
              {(v.phone||v.website) ? <Text style={{ color:'#6b7280' }}>{v.phone||''} {v.website? '• '+v.website: ''}</Text> : null}
              <Text selectable style={{ color:'#6b7280' }}>{v.id}</Text>
            </View>
            <Button kind="secondary" title="Delete" onPress={()=>del.mutate(v.id)} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};
