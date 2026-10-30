/**
 * Formatting utilities for clean user-facing presentation.
 * Enforces strictly no underscores in displayed IDs, tags, event types, or principal names.
 */

export function cleanUnderscores(value?: string | null): string {
  if (!value) return '';
  return value.replace(/_/g, '-');
}

export function formatFlowTag(tag: string): string {
  if (!tag) return '';
  // Convert flow strings like "reads_untrusted -> writes_external" to "reads untrusted → writes external"
  return tag
    .replace(/_/g, ' ')
    .replace(/->/g, '→');
}

export function formatAgentName(agentId?: string | null): string {
  if (!agentId) return 'Nemotron Agent';
  return agentId
    .replace(/^agent[_-]/i, '')
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatEventType(eventType?: string | null): string {
  if (!eventType) return 'Event';
  return eventType
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
