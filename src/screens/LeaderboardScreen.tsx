
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, H2, Input } from '../components/ui';
import { COLORS } from '../theme';
import { supabase } from '../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { shotsOnHole, stablefordPoints, PARS_DEFAULT, SI_DEFAULT } from '../utils/handicap';

type Player = { id:string; name:string; playing_hcp:number };
type EventT = { id:string; title:string };
type Score = { id:string; event_id:string; player_id:string; hole:number; strokes:number; points?:number|null; updated_at:string };

async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from('players').select('id,name,playing_hcp').order('name');
  if (error) throw error;
  return data as Player[];
}
async function fetchEvents(): Promise<EventT[]> {
  const { data, error } = await supabase.from('events').select('id,title').order('date');
  if (error) throw error;
  return data as EventT[];
}
async function fetchScores(eventId?:string): Promise<Score[]> {
  const q = supabase.from('scores').select('*').order('updated_at');
  const { data, error } = eventId ? await q.eq('event_id', eventId) : await q;
  if (error) throw error;
  return data as Score[];
}

export const LeaderboardScreen: React.FC = () => {
  const qc = useQueryClient();
  const { data: players=[] } = useQuery({ queryKey: ['players'], queryFn: fetchPlayers });
  const { data: events=[] } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
  const [eventId, setEventId] = useState<string|undefined>(undefined);
  const { data: scores=[] , refetch } = useQuery({ queryKey: ['scores', eventId], queryFn: () => fetchScores(eventId), enabled: true });

  const [playerId, setPlayerId] = useState<string|undefined>(undefined);
  const [hole, setHole] = useState(1);
  const [strokes, setStrokes] = useState(4);

  useEffect(() => {
    if (!eventId && events[0]) setEventId(events[0].id);
    if (!playerId && players[0]) setPlayerId(players[0].id);
  }, [events, players]);

  // Realtime subscription
  useEffect(() => {
    if (!eventId) return;
    const channel = supabase.channel(`scores:event:${eventId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'scores', filter: `event_id=eq.${eventId}` }, () => {
      refetch();
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  const player = players.find(p => p.id === playerId);
  const si = SI_DEFAULT[(hole-1)%18];
  const par = PARS_DEFAULT[(hole-1)%18];
  const shots = player ? shotsOnHole(player.playing_hcp, si) : 0;
  const ptsPreview = stablefordPoints({ par, grossStrokes: strokes, shotsReceived: shots });

  async function saveScore() {
    if (!eventId || !player) return;
    // upsert (unique event_id,player_id,hole) emulation
    const { data: existing } = await supabase.from('scores').select('id').eq('event_id', eventId).eq('player_id', player.id).eq('hole', hole).maybeSingle();
    const payload = { event_id: eventId, player_id: player.id, hole, strokes, points: ptsPreview };
    if (existing?.id) {
      await supabase.from('scores').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('scores').insert(payload);
    }
    qc.invalidateQueries({ queryKey: ['scores', eventId] });
  }

  const leaderboard = useMemo(() => {
    const rows: Record<string, { name:string; points:number; holes:number }> = {};
    scores.forEach(s => {
      const p = players.find(pl => pl.id === s.player_id);
      const name = p ? p.name : 'Unknown';
      if (!rows[s.player_id]) rows[s.player_id] = { name, points: 0, holes: 0 };
      rows[s.player_id].points += (s.points || 0);
      rows[s.player_id].holes += 1;
    });
    return Object.entries(rows).map(([player_id, v]) => ({ player_id, ...v })).sort((a,b)=>b.points-a.points);
  }, [scores, players]);

  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.bg, padding:16 }}>
      <H2>Enter Score</H2>
      <Card>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          <Input value={String(eventId||'')} onChangeText={setEventId as any} placeholder="Event ID" />
          <Input value={String(playerId||'')} onChangeText={setPlayerId as any} placeholder="Player ID" />
          <Input value={String(hole)} onChangeText={v=>setHole(Math.max(1, Math.min(18, Number(v)||1)))} placeholder="Hole (1-18)" />
          <Input value={String(strokes)} onChangeText={v=>setStrokes(Math.max(1, Number(v)||1))} placeholder="Strokes" />
          <Button title="Save" onPress={saveScore} />
        </View>
        <Text style={{ color:'#6b7280', marginTop:6 }}>SI {si} • Par {par} • Shots {shots} • Points {ptsPreview}</Text>
      </Card>

      <H2>Live Leaderboard</H2>
      {leaderboard.map((row, i) => (
        <Card key={row.player_id}>
          <Text style={{ fontWeight: '700', color: COLORS.navy }}>{i+1}. {row.name}</Text>
          <Text>Points: {row.points} • Holes: {row.holes}</Text>
        </Card>
      ))}
    </ScrollView>
  );
};
