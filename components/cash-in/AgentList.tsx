import React from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import SelectionCard from '@/components/ui/SelectionCard';
import { Agent } from '@/types';

interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | undefined;
  onAgentSelect: (agent: Agent) => void;
  style?: ViewStyle;
}

export default function AgentList({ agents, selectedAgent, onAgentSelect, style }: AgentListProps) {
  const { colors: COLORS } = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.TEXT }]}>Agents Disponibles</Text>
        <Text style={[styles.subtitle, { color: COLORS.GRAY_MEDIUM }]}> {agents.length} agent{agents.length > 1 ? 's' : ''} à proximité</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {agents.length === 0 ? (
          <Text style={[styles.emptyText, { color: COLORS.GRAY_MEDIUM }]}>Aucun agent disponible</Text>
        ) : (
          agents.map((agent, idx) => {
            const info = {
              title: agent.name,
              subtitle: agent.location,
              description: `${agent.phone} • Limite: ${agent.maxAmount}€/jour`,
            };
            return (
              <SelectionCard
                key={agent.id}
                icon={MapPin}
                iconColor={COLORS.PRIMARY}
                title={info.title}
                subtitle={info.subtitle}
                description={info.description}
                selected={selectedAgent?.id === agent.id}
                onPress={() => onAgentSelect(agent)}
                style={idx !== agents.length - 1 ? { marginBottom: 12 } : undefined}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
    flex: 1,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    ...TYPO.h3,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPO.caption,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyText: {
    ...TYPO.caption,
    textAlign: 'center',
    marginTop: 16,
  },
}); 