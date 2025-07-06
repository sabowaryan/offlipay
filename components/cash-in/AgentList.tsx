import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MapPin, Phone, Clock } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TYPO } from '@/utils/typography';
import SelectionCard from '@/components/ui/SelectionCard';
import { Agent } from '@/types';

interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | undefined;
  onAgentSelect: (agent: Agent) => void;
}

export default function AgentList({
  agents,
  selectedAgent,
  onAgentSelect,
}: AgentListProps) {
  const { colors: COLORS } = useThemeColors();

  const formatAgentInfo = (agent: Agent) => ({
    title: agent.name,
    subtitle: agent.location,
    description: `${agent.phone} • Limite: ${agent.maxAmount}€/jour`,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.TEXT }]}>
          Agents Disponibles
        </Text>
        <Text style={[styles.subtitle, { color: COLORS.GRAY_MEDIUM }]}>
          {agents.length} agent{agents.length > 1 ? 's' : ''} à proximité
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {agents.map((agent) => {
          const info = formatAgentInfo(agent);
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
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  title: {
    ...TYPO.h3,
  },
  subtitle: {
    ...TYPO.caption,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 20,
  },
}); 