
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, H2, Input } from '../components/ui';
import { COLORS } from '../theme';
import { supabase } from '../lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Player = { id:string; name:string; exact_hcp:number; playing_hcp:number; email?:string|null };

async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from('players').select('*').order('name');
  if (error) throw error;
  return data as Player[];
}

export const PlayersScreen: React.FC = () => {
  const qc = useQueryClient();
  const { data: players=[] } = useQuery({ queryKey: ['players'], queryFn: fetchPlayers });

  const [name, setName] = useState('');
  const [hi, setHi] = useState('10.0');
  const [email, setEmail] = useState('');

  const add = useMutation({
    mutationFn: async () => {
      const exact = Number(hi)||0;
      const { error } = await supabase.from('players').insert({ name, exact_hcp: exact, playing_hcp: exact, email: email||null });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['players'] }); setName(''); setHi('10.0'); setEmail(''); },
  });

  const del = useMutation({
    mutationFn: async (id:string) => {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });

  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.bg, padding:16 }}>
      <H2>Add Player</H2>
      <Card>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          <Input value={name} onChangeText={setName} placeholder="Name" />
          <Input value={hi} onChangeText={setHi} placeholder="Exact WHS (e.g. 12.4)" keyboardType="decimal-pad" />
          <Input value={email} onChangeText={setEmail} placeholder="Email (optional)" />
          <Button title={add.isPending ? 'Saving...' : 'Save'} onPress={()=> name.trim() && add.mutate()} />
        </View>
      </Card>

      <H2>Players</H2>
      {players.map(p => (
        <Card key={p.id}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <View>
              <Text style={{ fontWeight:'700' }}>{p.name}</Text>
              <Text>Exact: {Number(p.exact_hcp).toFixed(1)} | Playing: {p.playing_hcp}</Text>
            </View>
            <Button kind="secondary" title="Delete" onPress={()=>del.mutate(p.id)} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};
