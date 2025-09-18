
import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { COLORS } from '../theme';

export const Card: React.FC<React.PropsWithChildren> = ({ children }) => (
  <View style={{ borderRadius: 16, padding: 12, backgroundColor: COLORS.card, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2, marginVertical: 6, borderWidth:1, borderColor: COLORS.border }}>
    {children}
  </View>
);

export const H1: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 8, color: COLORS.navy }}>{children as any}</Text>
);

export const H2: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8, color: COLORS.text }}>{children as any}</Text>
);

export const Row: React.FC<{children: any}> = ({ children }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>{children}</View>
);

export const Button: React.FC<{ title: string; onPress: () => void; kind?: 'primary'|'secondary' }> = ({ title, onPress, kind='primary' }) => (
  <Pressable onPress={onPress} style={{ backgroundColor: kind==='primary'? COLORS.navy : '#fff', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth:1, borderColor: kind==='primary'? COLORS.navy : COLORS.border, marginRight:8 }}>
    <Text style={{ color: kind==='primary'? '#fff' : COLORS.navy, fontWeight: '700' }}>{title}</Text>
  </Pressable>
);

export const Input: React.FC<{ value: string; onChangeText: (v:string)=>void; placeholder?: string; style?: any; keyboardType?: any }> = ({ value, onChangeText, placeholder, style, keyboardType }) => (
  <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} style={[{ backgroundColor:'#fff', borderColor: COLORS.border, borderWidth: 1, padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8, minWidth: 120 }, style]} />
);
