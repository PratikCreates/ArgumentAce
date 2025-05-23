import { GraduationCap, Sparkles } from 'lucide-react';

const ArgumentAceLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const textSizeClass = size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : 'text-3xl';
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 22 : 28;

  return (
    <div className="flex items-center gap-2">
      <GraduationCap className={`text-primary`} size={iconSize} />
      <h1 className={`font-bold ${textSizeClass} text-primary`}>
        Argument<span className="text-accent">Ace</span>
      </h1>
      <Sparkles className="text-accent" size={iconSize * 0.8} />
    </div>
  );
};

export default ArgumentAceLogo;
