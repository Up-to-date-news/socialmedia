"use client";

import { useEffect, useMemo, useState } from "react";
import { ActiveTab, DateRange, Platform, PlatformId, Post, ThemeMode } from "@/lib/types";
import { INITIAL_PLATFORMS, INITIAL_POSTS } from "@/lib/mock-data";
import { useToast } from "@/lib/toast-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { TAB_HEADINGS } from "@/components/layout/nav-items";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { PublishTab } from "@/components/publish/PublishTab";
import { HistoryTab } from "@/components/history/HistoryTab";
import { DeleteModal } from "@/components/history/DeleteModal";
import { StatsModal } from "@/components/history/StatsModal";
import { ApiVaultTab } from "@/components/auth/ApiVaultTab";

const SAMPLE_TITLES = [
  "Multi-Cloud Architecture Trends 2026",
  "Machine Learning Pipelines in Production",
  "Design Systems: Micro-Interactions & UX Mastery",
  "Q3 Product Roadmap & Feature Reveal",
];

export function AppShell() {
  const { showToast } = useToast();

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const [user] = useState({ name: "Alex Rivera", email: "alex@omnisocial.io" });

  const [platforms, setPlatforms] = useState<Platform[]>(INITIAL_PLATFORMS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(
    INITIAL_PLATFORMS.map((p) => p.id)
  );
  const [previewPlatform, setPreviewPlatform] = useState<PlatformId>("telegram");
  const [isPublishing, setIsPublishing] = useState(false);

  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("ALL");

  const [deleteModalPost, setDeleteModalPost] = useState<Post | null>(null);
  const [statsModalPost, setStatsModalPost] = useState<Post | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const aggregatedStats = useMemo(() => {
    const totalReach = platforms.reduce((acc, p) => acc + p.followers, 0);
    const totalPostsCount = posts.length + platforms.reduce((acc, p) => acc + p.posts, 0);
    const totalEngagements =
      platforms.reduce((acc, p) => acc + p.engagements, 0) +
      posts.reduce((acc, p) => acc + p.metrics.likes + p.metrics.comments + p.metrics.shares, 0);
    return { totalReach, totalPostsCount, totalEngagements, peakTime: "18:30 UTC" };
  }, [platforms, posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (platformFilter !== "ALL") {
        const pState = post.platforms[platformFilter as PlatformId];
        if (!pState || pState.status !== "SUCCESS") return false;
      }
      if (statusFilter !== "ALL" && post.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(query);
        const matchContent = post.content.toLowerCase().includes(query);
        if (!matchTitle && !matchContent) return false;
      }
      if (dateRange !== "ALL") {
        const postDate = new Date(post.created_at);
        const now = new Date();
        const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
        if (dateRange === "TODAY" && diffDays > 1) return false;
        if (dateRange === "WEEK" && diffDays > 7) return false;
        if (dateRange === "MONTH" && diffDays > 30) return false;
      }
      return true;
    });
  }, [posts, platformFilter, statusFilter, searchQuery, dateRange]);

  const toggleAllPlatforms = () => {
    setSelectedPlatforms((prev) => (prev.length === platforms.length ? [] : platforms.map((p) => p.id)));
  };

  const togglePlatform = (id: PlatformId) => {
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handlePublishNow = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      showToast("Please provide both a Title and Content body.", "error");
      return;
    }
    if (selectedPlatforms.length === 0) {
      showToast("Please select at least one social media platform.", "error");
      return;
    }

    setIsPublishing(true);

    const newPlatformStatuses: Post["platforms"] = {};
    for (const id of selectedPlatforms) {
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 250));
      const isSuccess = Math.random() > 0.05;
      newPlatformStatuses[id] = isSuccess
        ? { status: "SUCCESS", platform_post_id: `${id.slice(0, 2)}_${Math.floor(Math.random() * 899 + 100)}` }
        : { status: "FAILED", error: "API Timeout / Auth token refresh required" };
    }

    const values = Object.values(newPlatformStatuses);
    const overallStatus = values.every((s) => s.status === "SUCCESS")
      ? "SUCCESS"
      : values.some((s) => s.status === "SUCCESS")
      ? "PARTIAL"
      : "FAILED";

    const newPost: Post = {
      post_id: `post-${Date.now()}`,
      title: postTitle,
      content: postContent,
      image: selectedImage,
      created_at: new Date().toISOString(),
      status: overallStatus,
      platforms: newPlatformStatuses,
      metrics: { likes: 0, comments: 0, shares: 0 },
    };

    setPosts((prev) => [newPost, ...prev]);
    setPlatforms((prev) =>
      prev.map((p) =>
        selectedPlatforms.includes(p.id) && newPlatformStatuses[p.id]?.status === "SUCCESS"
          ? { ...p, posts: p.posts + 1 }
          : p
      )
    );

    setIsPublishing(false);
    setPostTitle("");
    setPostContent("");
    showToast("Post published across selected platforms successfully!", "success");
    setActiveTab("history");
  };

  const handleAddMockPost = () => {
    const randomTitle = SAMPLE_TITLES[Math.floor(Math.random() * SAMPLE_TITLES.length)];
    const mockPost: Post = {
      post_id: `post-${Date.now()}`,
      title: randomTitle,
      content:
        "A comprehensive dive into scalable infrastructure, cloud latency reduction, and modern software design patterns.",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      created_at: new Date().toISOString(),
      status: "SUCCESS",
      platforms: platforms.reduce((acc, p) => {
        acc[p.id] = { status: "SUCCESS", platform_post_id: `${p.id}_mock_${Math.floor(Math.random() * 100)}` };
        return acc;
      }, {} as Post["platforms"]),
      metrics: {
        likes: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 80),
        shares: Math.floor(Math.random() * 40),
      },
    };
    setPosts((prev) => [mockPost, ...prev]);
    showToast("Mock sample post injected into History feed!", "success");
  };

  const confirmDeletePost = () => {
    if (!deleteModalPost) return;
    setPosts((prev) => prev.filter((p) => p.post_id !== deleteModalPost.post_id));
    const restrictedPlatforms = platforms
      .filter((p) => !p.directDelete && deleteModalPost.platforms[p.id]?.status === "SUCCESS")
      .map((p) => p.name);
    if (restrictedPlatforms.length > 0) {
      showToast(`Deleted via native APIs! ${restrictedPlatforms.join(", ")} required manual removal.`, "warning");
    } else {
      showToast("Successfully purged post across connected platform APIs!", "success");
    }
    setDeleteModalPost(null);
  };

  const navigateTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      <MobileNav
        activeTab={activeTab}
        onTabChange={navigateTab}
        postCount={posts.length}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        onInjectSample={handleAddMockPost}
      />

      <div className="flex h-screen sm:h-screen overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          postCount={posts.length}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          userName={user.name}
          userRole="Administrator"
          onInjectSample={handleAddMockPost}
        />

        <main className="flex-1 flex flex-col overflow-y-auto">
          <Header activeTab={activeTab} onNewPost={() => setActiveTab("create")} platformCount={platforms.length} />

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
            <h2 className="sm:hidden text-lg font-bold text-ink">{TAB_HEADINGS[activeTab]}</h2>

            {activeTab === "dashboard" && (
              <DashboardTab
                platforms={platforms}
                stats={aggregatedStats}
                onPostHere={(id) => {
                  setPreviewPlatform(id as PlatformId);
                  setActiveTab("create");
                }}
              />
            )}

            {activeTab === "create" && (
              <PublishTab
                platforms={platforms}
                title={postTitle}
                onTitleChange={setPostTitle}
                content={postContent}
                onContentChange={setPostContent}
                image={selectedImage}
                onImageChange={setSelectedImage}
                selectedPlatforms={selectedPlatforms}
                onTogglePlatform={togglePlatform}
                onToggleAllPlatforms={toggleAllPlatforms}
                isPublishing={isPublishing}
                onPublish={handlePublishNow}
                onSchedule={() => showToast("Scheduling engine: Post set for peak window 18:30 UTC", "info")}
                previewPlatform={previewPlatform}
                onPreviewPlatformChange={setPreviewPlatform}
              />
            )}

            {activeTab === "history" && (
              <HistoryTab
                posts={posts}
                filteredPosts={filteredPosts}
                platforms={platforms}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                platformFilter={platformFilter}
                onPlatformFilterChange={setPlatformFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onShowStats={setStatsModalPost}
                onDelete={setDeleteModalPost}
                onResetFilters={() => {
                  setPlatformFilter("ALL");
                  setStatusFilter("ALL");
                  setSearchQuery("");
                  setDateRange("ALL");
                }}
              />
            )}

            {activeTab === "auth" && (
              <ApiVaultTab
                platforms={platforms}
                authenticated={authenticated}
                onToggleSession={() => {
                  setAuthenticated((a) => !a);
                  showToast(authenticated ? "Logged out session" : "Re-authenticated successfully", "info");
                }}
                userName={user.name}
                userEmail={user.email}
              />
            )}
          </div>
        </main>
      </div>

      {deleteModalPost && (
        <DeleteModal
          post={deleteModalPost}
          platforms={platforms}
          onCancel={() => setDeleteModalPost(null)}
          onConfirm={confirmDeletePost}
        />
      )}

      {statsModalPost && (
        <StatsModal post={statsModalPost} platforms={platforms} onClose={() => setStatsModalPost(null)} />
      )}
    </div>
  );
}
