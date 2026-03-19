import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Activity, Globe, Github, Send, MapPin, Edit3, Calendar, Star } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { type Event, type FullUser, type ProfileStats } from '../types';
import { EditProfileModal } from '../components/EditProfileModal';


export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [profileUser, setProfileUser] = useState<FullUser | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ organized: 0, attended: 0, topTags: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const userRes = await api.get<FullUser>(`${import.meta.env.VITE_API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileUser(userRes.data);
      } catch (err) {
        console.error('User fetch error:', err);
        if (currentUser?.id === Number(id)) {
          setProfileUser(currentUser as FullUser);
        }
      }

      try {
        const eventsRes = await api.get<Event[]>(`${import.meta.env.VITE_API_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allEvents = eventsRes.data;

        const organized = allEvents.filter(e => e.organizer?.id === Number(id));
        const attended = allEvents.filter(e => e.participants?.some(p => p.id === Number(id)));

        const seenIds = new Set<number>();
        const unique = [...organized, ...attended].filter(e => {
          if (seenIds.has(e.id)) return false;
          seenIds.add(e.id);
          return true;
        });

        const tagsCount: Record<string, number> = {};
        unique.forEach(event => {
          event.tags?.forEach(tag => {
            tagsCount[tag.name] = (tagsCount[tag.name] || 0) + 1;
          });
        });

        const topTags = Object.entries(tagsCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, count]) => ({ name, count }));

        setStats({ organized: organized.length, attended: attended.length, topTags });
      } catch (err) {
        console.error('Events fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-brand-darkText font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg flex items-center justify-center">
        <p className="text-gray-500 dark:text-brand-darkText">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const totalEvents = stats.organized + stats.attended;
  const maxTagCount = stats.topTags[0]?.count ?? 1;

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-darkBg py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6">

        <div className="bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm border border-gray-100 dark:border-brand-darkBorder overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-brand-blue via-indigo-500 to-brand-orange" />
          <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-center md:items-end gap-5 -mt-14 relative z-10">
            <div className="shrink-0 ring-4 ring-white dark:ring-brand-darkCard rounded-full shadow-lg">
                <UserAvatar name={profileUser.email} size={108} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                {profileUser.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1 text-sm text-gray-500 dark:text-brand-darkText">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-brand-blue shrink-0" />
                  {profileUser.email}
                </span>
                {profileUser.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-orange shrink-0" />
                    {profileUser.location}
                  </span>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="shrink-0 mb-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5">Activity</h3>
              <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-brand-darkBorder text-center">
                <StatBlock label="Attended" value={stats.attended} icon={<Calendar size={15} />} color="text-brand-blue" />
                <StatBlock label="Created" value={stats.organized} icon={<Star size={15} />} color="text-brand-orange" />
                <StatBlock label="Total" value={totalEvents} color="text-gray-700 dark:text-gray-200" />
              </div>
            </div>

            {(profileUser.github || profileUser.website || profileUser.telegram) && (
              <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5">Connect</h3>
                <div className="flex justify-around">
                  {profileUser.github && (
                    <a href={profileUser.github} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-brand-darkBg transition-colors">
                      <Github size={20} />
                    </a>
                  )}
                  {profileUser.website && (
                    <a href={profileUser.website} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-brand-darkBg transition-colors">
                      <Globe size={20} />
                    </a>
                  )}
                  {profileUser.telegram && (
                    <a href={`https://t.me/${profileUser.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-brand-darkBg transition-colors">
                      <Send size={20} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-8 space-y-6">
            {(profileUser.bio || isOwnProfile) && (
              <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Bio</h3>
                {profileUser.bio ? (
                  <p className="text-gray-600 dark:text-brand-darkText leading-relaxed text-sm">{profileUser.bio}</p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm italic">You haven't added a bio yet.</p>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <Activity size={18} className="text-brand-blue" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Interest DNA</h2>
              </div>
              {stats.topTags.length > 0 ? (
                <div className="space-y-4">
                  {stats.topTags.map((tag) => (
                    <div key={tag.name}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">#{tag.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{tag.count} {tag.count === 1 ? 'event' : 'events'}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-brand-darkBg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-blue rounded-full transition-all duration-700"
                          style={{ width: `${Math.min((tag.count / maxTagCount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-brand-darkBorder rounded-xl">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No activity yet — join some events!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={{
            name: profileUser.name,
            bio: profileUser.bio,
            location: profileUser.location,
            github: profileUser.github,
            website: profileUser.website,
            telegram: profileUser.telegram,
          }}
          onSaved={(updated) => setProfileUser(prev => prev ? { ...prev, ...updated } : prev)}
        />
      )}
    </div>
  );
}

function StatBlock({ label, value, icon, color }: { label: string; value: number; icon?: React.ReactNode; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3">
      {icon && <span className={`${color} opacity-70`}>{icon}</span>}
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
    </div>
  );
}