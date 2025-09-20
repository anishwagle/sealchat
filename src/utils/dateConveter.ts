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

  export {getTimeSince,getTimeUntil};