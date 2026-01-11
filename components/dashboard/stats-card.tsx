interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

export function StatsCard({ title, value, icon, iconBgColor }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
