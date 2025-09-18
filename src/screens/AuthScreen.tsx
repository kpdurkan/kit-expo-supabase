
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { Button, Card, H2, Input } from '../components/ui';
import { supabase } from '../lib/supabase';
import { COLORS } from '../theme';

export const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function sendLink() {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'kdt://callback' } });
    setBusy(false);
    setMsg(error ? String(error.message) : 'Magic link sent. Check your email.');
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor: COLORS.bg, padding:16 }}>
      <H2>Sign in</H2>
      <Card>
        <Input value={email} onChangeText={setEmail} placeholder="Your email" />
        <Button title={busy ? 'Sending…' : 'Send magic link'} onPress={sendLink} />
        {msg ? <Text style={{ marginTop:8, color:'#6b7280' }}>{msg}</Text> : null}
      </Card>
    </ScrollView>
  );
};
