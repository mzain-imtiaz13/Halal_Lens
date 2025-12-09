export function formatDate(dateString) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString; // fallback

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
