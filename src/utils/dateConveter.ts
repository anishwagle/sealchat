const getTimeSince = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };
  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    if (seconds < 60) return "expires in just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return `expires in ${minutes} min${minutes === 1 ? "" : "s"}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `expires in ${hours} hr${hours === 1 ? "" : "s"}`;
    const days = Math.floor(hours / 24);
    return `expires in ${days} day${days === 1 ? "" : "s"}`;
  };
const formatToMySQLDate = (input: Date | string): string => {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date?.getTime())) {
    return '1970-01-01 00:00:00';
  }
  const nptOffset = (5 * 60 + 45) * 60 * 1000; // +05:45 in ms
  const nptDate = new Date(date.getTime() + nptOffset);
  return nptDate.toISOString().slice(0, 19).replace('T', ' ');
};
export {getTimeSince,getTimeUntil,formatToMySQLDate};