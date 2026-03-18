export const getLogStyle = (type) => {
  switch (type) {
    case 'Contact': return 'text-blue-400 font-bold';
    case 'Deny': return 'text-red-400 font-bold';
    case 'Success': return 'text-green-400 font-bold';
    case 'Victory': return 'text-yellow-400 font-black uppercase tracking-wider';
    case 'Failure': return 'text-orange-400 italic';
    default: return 'text-purple-400 italic';
  }
};

export const getLogBorderColor = (type) => {
  const style = getLogStyle(type);
  if (style.includes('blue')) return 'border-blue-500';
  if (style.includes('red')) return 'border-red-500';
  if (style.includes('green')) return 'border-green-500';
  if (style.includes('yellow')) return 'border-yellow-500';
  if (style.includes('orange')) return 'border-orange-500';
  return 'border-purple-500';
};
