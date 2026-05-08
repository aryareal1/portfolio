export function getAvatarColor(name: string): string {
  const colors = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
    'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', // Blue to Teal
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', // Amber to Red
    'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', // Emerald to Blue
    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', // Pink to Violet
    'linear-gradient(135deg, #f97316 0%, #eab308 100%)', // Orange to Yellow
  ];

  // Simple hash function to get a consistent index for the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
