interface LoanStatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats: {
    active: number;
    returned: number;
    all: number;
  };
}

export default function LoanStatusTabs({ activeTab, onTabChange, stats }: LoanStatusTabsProps) {
  const tabs = [
    { id: 'all', label: 'Todos', count: stats.all, color: 'bg-blue-500' },
    { id: 'active', label: 'Activos', count: stats.active, color: 'bg-yellow-500' },
    { id: 'returned', label: 'Historial', count: stats.returned, color: 'bg-green-500' },
  ];

  return (
    <div className="flex space-x-1 bg-white/10 rounded-2xl p-2 backdrop-blur-lg border border-white/20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === tab.id
              ? `${tab.color} text-white shadow-lg transform scale-105`
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>{tab.label}</span>
          {tab.count > 0 && (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}