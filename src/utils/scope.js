/** Limits rows to the signed-in user's records when their role has "own" access. */
export const scopeRows = (rows, user, level, key = 'ownerId') => (level === 'own' && user ? rows.filter((r) => r[key] === user.id) : rows);
