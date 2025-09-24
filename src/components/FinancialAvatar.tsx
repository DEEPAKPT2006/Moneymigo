interface FinancialAvatarProps {
  profile: any;
}

export function FinancialAvatar({ profile }: FinancialAvatarProps) {
  if (!profile) return null;

  const getAvatarEmoji = (type: string, level: number) => {
    const baseEmojis = {
      rebuilding: "🌱",
      growing: "🌿",
      stable: "🌳",
      thriving: "🌟",
    };
    
    return baseEmojis[type as keyof typeof baseEmojis] || "🌱";
  };

  const getAvatarColor = (type: string) => {
    const colors = {
      rebuilding: "from-red-400 to-orange-400",
      growing: "from-yellow-400 to-green-400",
      stable: "from-green-400 to-blue-400",
      thriving: "from-blue-400 to-purple-400",
    };
    
    return colors[type as keyof typeof colors] || "from-gray-400 to-gray-500";
  };

  const getPersonalityBadge = (personality: string) => {
    const badges = {
      saver: { emoji: "💰", color: "bg-green-100 text-green-800", label: "Saver" },
      spender: { emoji: "💸", color: "bg-red-100 text-red-800", label: "Spender" },
      balanced: { emoji: "⚖️", color: "bg-blue-100 text-blue-800", label: "Balanced" },
      impulsive: { emoji: "⚡", color: "bg-yellow-100 text-yellow-800", label: "Impulsive" },
    };
    
    return badges[personality as keyof typeof badges] || badges.balanced;
  };

  const personalityBadge = getPersonalityBadge(profile.financialDNA.spendingPersonality);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-md mx-auto">
      <div className="text-center">
        {/* Avatar Circle */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${getAvatarColor(profile.avatarType)} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <span className="text-4xl">
            {getAvatarEmoji(profile.avatarType, profile.avatarLevel)}
          </span>
        </div>

        {/* Avatar Info */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Level {profile.avatarLevel} {profile.avatarType.charAt(0).toUpperCase() + profile.avatarType.slice(1)}
        </h3>
        
        {/* Consistency Score */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Financial Consistency</span>
            <span>{profile.financialDNA.consistencyScore.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${profile.financialDNA.consistencyScore}%` }}
            ></div>
          </div>
        </div>

        {/* Financial DNA */}
        <div className="space-y-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${personalityBadge.color}`}>
            <span className="mr-1">{personalityBadge.emoji}</span>
            {personalityBadge.label}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-medium">Risk Tolerance</div>
              <div className="capitalize">{profile.financialDNA.riskTolerance}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-medium">Goal Focus</div>
              <div className="capitalize">{profile.financialDNA.goalOrientation}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
