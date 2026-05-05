import { useEffect, useState } from "react";
import { getUniversities, getPrograms, getStreams, getSubjects, getRecentActivity } from "@/api/api";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Building2, Book, GraduationCap, Library, PlusCircle, Pencil, Trash2 } from "lucide-react";

const Dashboard = () => {
  const [counts, setCounts] = useState({
    universities: 0,
    programs: 0,
    streams: 0,
    subjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setActivityLoading(true);

      try {
        // Fetch counts and recent activity in parallel
        const [
          universitiesRes,
          programsRes,
          streamsRes,
          subjectsRes,
          activityRes,
        ] = await Promise.all([
          getUniversities(), // 0
          getPrograms(), // 1
          getStreams(), // 2
          getSubjects(), // 3
          getRecentActivity(), // 4
        ]);

        setRecentActivity(activityRes.data);

        setCounts({
          universities: universitiesRes.data?.length || 0,
          programs: programsRes.data?.length || 0,
          streams: streamsRes.data?.length || 0,
          subjects: subjectsRes.data?.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Optionally, show a toast notification for the error
      } finally {
        setLoading(false);
        setActivityLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

    const cardData = [
        {
            title: "Total Universities",
            count: counts.universities,
            Icon: Building2,
            path: "/universities",
            color: "text-sky-600",
            bgColor: "bg-sky-100",
        },
        {
            title: "Total Programs",
            count: counts.programs,
            Icon: GraduationCap,
            path: "/programs",
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
        {
            title: "Total Streams",
            count: counts.streams,
            Icon: Library,
            path: "/streams",
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        { title: "Total Subjects", count: counts.subjects, Icon: Book, path: "/subjects", color: "text-amber-600", bgColor: "bg-amber-100" },
    ];

    const activityIconMap = {
        Created: PlusCircle,
        Updated: Pencil,
        Deleted: Trash2,
    };

  return (
    <div className="p-4">
        <div className="mb-6 rounded-2xl bg-card text-card-foreground shadow p-6">
            <h2 className="text-lg font-semibold">Welcome 👋</h2>
            <p className="text-sm text-muted-foreground mt-2">
                to the admin dashboard. Use the sidebar to navigate through different sections.
            </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading
            ? cardData.map((card) => (
                <div key={card.title} className="rounded-2xl bg-card text-card-foreground shadow p-6 animate-pulse">
                  <div className="flex items-start justify-between">
                      <div className="flex flex-col space-y-2">
                          <div className="h-5 bg-muted rounded w-3/4"></div>
                          <div className="h-8 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-12 w-12 bg-muted rounded-full"></div>
                  </div>
                </div>
              ))
            : cardData.map(({ title, count, Icon, path, color, bgColor }) => (
                <Link to={path} key={title} className="group block">
                    <div className="rounded-2xl  border-2 border-gray-200 bg-card text-card-foreground shadow-lg p-6 h-full transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-xl">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-md font-medium text-muted-foreground">{title}</h3>
                                <p className="text-3xl font-bold mt-2">{count}</p>
                            </div>
                            <div className={`p-3 rounded-full ${bgColor}`}><Icon className={`h-6 w-6 ${color}`} /></div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 rounded-2xl bg-card text-card-foreground shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {activityLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4 animate-pulse">
                            <div className="h-9 w-9 bg-muted rounded-full"></div>
                            <div className="flex-grow space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    recentActivity.map((activity) => {
                        const Icon = activityIconMap[activity.action] || Pencil;
                        return (
                            <div key={activity._id} className="flex items-center space-x-4">
                                <div className="p-2 bg-muted rounded-full">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-sm">{`${activity.action} ${activity.entity}`}</p>
                                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                                </div>
                                <p className="text-xs text-muted-foreground flex-shrink-0">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                            </div>
                        );
                    })
                )}
                { !activityLoading && recentActivity.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default Dashboard;