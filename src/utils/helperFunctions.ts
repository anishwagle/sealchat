const toTitleCase = (text: string): string => {
  return text
    .trim()
    .split(/\s+/) // handles multiple spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
export {toTitleCase};