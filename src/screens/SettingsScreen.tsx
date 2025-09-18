
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, H2, Input } from '../components/ui';
import { COLORS } from '../theme';
import { computePlayingHandicap } from '../utils/handicap';
import { supabase } from '../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type Player = { id:string; name:string; exact_hcp:number; playing_hcp:number };

async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from('players').select('*').order('name');
  if (error) throw error;
  return data as Player[];
}

export const SettingsScreen: React.FC = () => {
  const qc = useQueryClient();
  const { data: players=[] } = useQuery({ queryKey: ['players'], queryFn: fetchPlayers });
  const [slope, setSlope] = useState('120');
  const [cr, setCr] = useState('70');
  const [par, setPar] = useState('71');
  const [allowance, setAllowance] = useState('0.95');

  async function recalcPlaying() {
    const slopeN = Number(slope)||120;
    const crN = Number(cr)||70;
    const parN = Number(par)||71;
    const allowanceN = Number(allowance)||0.95;
    for (const p of players) {
      const ph = computePlayingHandicap({ hi: Number(p.exact_hcp)||0, slope: slopeN, courseRating: crN, par: parN, allowance: allowanceN });
      await supabase.from('players').update({ playing_hcp: ph }).eq('id', p.id);
    }
    qc.invalidateQueries({ queryKey: ['players'] });
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.bg, padding:16 }}>
      <H2>WHS / Course Settings</H2>
      <Card>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          <Input value={slope} onChangeText={setSlope} placeholder="Slope (55-155)" />
          <Input value={cr} onChangeText={setCr} placeholder="Course Rating" />
          <Input value={par} onChangeText={setPar} placeholder="Par" />
          <Input value={allowance} onChangeText={setAllowance} placeholder="Allowance (0.95)" />
          <Button title="Recalculate Playing HCPs" onPress={recalcPlaying} />
        </View>
        <Text style={{ color:'#6b7280', marginTop:6 }}>Updates each player's playing handicap server-side.</Text>
      </Card>
    </ScrollView>
  );
};
