import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from '../ui/Card';

export default function ActivityChart({ data = [], title = 'Study activity' }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card hover={false} className="col-span-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-parchment">{title}</h3>
      </div>
      {hasData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8B95B" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#E8B95B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#15141F',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#EDE8DA',
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#E8B95B" strokeWidth={2} fill="url(#activityFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
          Not enough activity yet. Take a quiz or chat with your tutor to see trends here.
        </div>
      )}
    </Card>
  );
}
