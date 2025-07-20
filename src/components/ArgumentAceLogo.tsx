import { GraduationCap, Sparkles } from 'lucide-react';

const ArgumentAceLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const textSizeClass = size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : 'text-3xl';
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 22 : 28;
  const sloganSizeClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <GraduationCap className={`text-primary`} size={iconSize} />
        <h1 className={`font-bold ${textSizeClass} text-primary`}>
          Argument<span className="text-accent">Ace</span>
        </h1>
        <Sparkles className="text-accent" size={iconSize * 0.8} />
      </div>
      <p className={`${sloganSizeClass} text-muted-foreground ml-1`}>Your Own AI Debate Guide</p>
    </div>
  );
};

export default ArgumentAceLogo;
