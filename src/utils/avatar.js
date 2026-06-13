// Deterministic avatar colour based on a user's name.
const AVATAR_COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777']

export const avatarColor = name => AVATAR_COLORS[(name.charCodeAt(0) + name.length) % AVATAR_COLORS.length]
