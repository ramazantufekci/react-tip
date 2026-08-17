export const getPollSlug = (poll) => {
  if (!poll) return '';

  // Backend artık slug gönderiyor.
  if (poll.slug) {
    return poll.slug;
  }

  // Eski kayıtlar için fallback.
  if (poll.question) {
    return poll.question
      .toString()
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  return '';
};
