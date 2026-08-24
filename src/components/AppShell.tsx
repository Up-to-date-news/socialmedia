"use client";

import { useEffect, useMemo, useState } from "react";
import { ActiveTab, DateRange, Platform, PlatformId, Post, ThemeMode } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api-client";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { TAB_HEADINGS } from "@/components/layout/nav-items";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { PublishTab } from "@/components/publish/PublishTab";
import { HistoryTab } from "@/components/history/HistoryTab";
import { ScheduledTab } from "@/components/scheduled/ScheduledTab";
import { DeleteModal } from "@/components/history/DeleteModal";
import { StatsModal } from "@/components/history/StatsModal";
import { ApiVaultTab } from "@/components/auth/ApiVaultTab";
import { LoginScreen } from "@/components/auth/LoginScreen";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export function AppShell() {
  const { showToast } = useToast();

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [userEmail, setUserEmail] = useState("");

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(DEFAULT_IMAGE);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>([]);
  const [previewPlatform, setPreviewPlatform] = useState<PlatformId>("telegram");
  const [isPublishing, setIsPublishing] = useState(false);

  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("ALL");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [deleteModalPost, setDeleteModalPost] = useState<Post | null>(null);
  const [statsModalPost, setStatsModalPost] = useState<Post | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const loadPlatforms = async (resetSelection = false) => {
    const { platforms: data } = await api.platforms();
    setPlatforms(data);
    if (resetSelection) setSelectedPlatforms(data.map((p) => p.id));
  };

  const loadPosts = async () => {
    const { posts: data } = await api.posts();
    setPosts(data);
  };

  useEffect(() => {
    api
      .session()
      .then(async (session) => {
        if (session.authenticated && session.email) {
          setUserEmail(session.email);
          setAuthState("authenticated");
          await Promise.all([loadPlatforms(true), loadPosts()]);
        } else {
          setAuthState("unauthenticated");
        }
      })
      .catch(() => setAuthState("unauthenticated"));
  }, []);

  useEffect(() => {
    if (authState !== "authenticated") return;
    // GET /api/posts opportunistically fires any SCHEDULED post whose time
    // has passed, so polling it keeps the Scheduled Posts view (and Dashboard
    // counts) in sync without a manual refresh once a post goes live.
    const interval = setInterval(() => {
      loadPosts().catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, [authState]);

  const handleLoginSuccess = async (email: string) => {
    setUserEmail(email);
    setAuthState("authenticated");
    try {
      await Promise.all([loadPlatforms(true), loadPosts()]);
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    setAuthState("unauthenticated");
    setPosts([]);
    setPlatforms([]);
    setActiveTab("dashboard");
  };

  const scheduledCount = useMemo(() => posts.filter((p) => p.status === "SCHEDULED").length, [posts]);

  const aggregatedStats = useMemo(() => {
    const totalPosts = posts.length;
    const totalEngagements = posts.reduce(
      (acc, p) => acc + p.metrics.likes + p.metrics.comments + p.metrics.shares,
      0
    );
    const connectedCount = platforms.filter((p) => p.connected).length;
    const lastPublished = posts[0] ? new Date(posts[0].created_at).toLocaleDateString() : "No posts yet";
    return { totalPosts, totalEngagements, connectedCount, lastPublished };
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
      if (customFrom) {
        const postDate = new Date(post.created_at);
        const from = new Date(customFrom);
        from.setHours(0, 0, 0, 0);
        if (postDate < from) return false;
      }
      if (customTo) {
        const postDate = new Date(post.created_at);
        const to = new Date(customTo);
        to.setHours(23, 59, 59, 999);
        if (postDate > to) return false;
      }
      return true;
    });
  }, [posts, platformFilter, statusFilter, searchQuery, dateRange, customFrom, customTo]);

  const toggleAllPlatforms = () => {
    setSelectedPlatforms((prev) => (prev.length === platforms.length ? [] : platforms.map((p) => p.id)));
  };

  const togglePlatform = (id: PlatformId) => {
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handlePublishNow = async (scheduledAt?: string) => {
    if (!postTitle.trim() || !postContent.trim()) {
      showToast("Please provide both a Title and Content body.", "error");
      return;
    }
    if (selectedPlatforms.length === 0) {
      showToast("Please select at least one social media platform.", "error");
      return;
    }

    setIsPublishing(true);
    try {
      let imageUrl: string | undefined = selectedImage || undefined;
      if (selectedImageFile) {
        const uploaded = await api.upload(selectedImageFile);
        imageUrl = uploaded.url;
      }

      const { post } = await api.createPost({
        title: postTitle,
        content: postContent,
        imageUrl,
        platformIds: selectedPlatforms,
        scheduledAt,
      });

      setPosts((prev) => [post, ...prev]);
      setPostTitle("");
      setPostContent("");
      setSelectedImageFile(null);

      if (post.status === "SCHEDULED") {
        showToast(`Post scheduled for ${new Date(post.scheduled_at!).toLocaleString()}.`, "success");
      } else {
        const toneByStatus = { SUCCESS: "success", PARTIAL: "warning", FAILED: "error" } as const;
        showToast(
          post.status === "SUCCESS"
            ? "Post published across selected platforms successfully!"
            : `Post published with status: ${post.status}. Check Stats for per-platform errors.`,
          toneByStatus[post.status]
        );
      }
      await loadPlatforms();
      setActiveTab("history");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishScheduledNow = async (post: Post) => {
    try {
      const { post: updated } = await api.publishScheduledNow(post.post_id);
      setPosts((prev) => prev.map((p) => (p.post_id === updated.post_id ? updated : p)));
      showToast(
        updated.status === "SUCCESS" ? "Post published early!" : `Published with status: ${updated.status}.`,
        updated.status === "SUCCESS" ? "success" : "warning"
      );
      await loadPlatforms();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const confirmDeletePost = async () => {
    if (!deleteModalPost) return;
    const postId = deleteModalPost.post_id;
    try {
      const result = await api.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.post_id !== postId));
      if (result.restrictedPlatforms.length > 0) {
        showToast(
          `Deleted via native APIs! ${result.restrictedPlatforms.join(", ")} require manual removal.`,
          "warning"
        );
      } else {
        showToast("Successfully purged post across connected platform APIs!", "success");
      }
      await loadPlatforms();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setDeleteModalPost(null);
    }
  };

  const handleRefreshStats = async (postId: string) => {
    try {
      const { post } = await api.refreshStats(postId);
      setPosts((prev) => prev.map((p) => (p.post_id === postId ? post : p)));
      setStatsModalPost(post);
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  const navigateTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  if (authState === "loading") {
    return <div className="min-h-screen bg-bg" />;
  }

  if (authState === "unauthenticated") {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <MobileNav
        activeTab={activeTab}
        onTabChange={navigateTab}
        postCount={posts.length}
        scheduledCount={scheduledCount}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      <div className="flex h-screen sm:h-screen overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          postCount={posts.length}
          scheduledCount={scheduledCount}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          userEmail={userEmail}
        />

        <main className="flex-1 flex flex-col overflow-y-auto">
          <Header
            activeTab={activeTab}
            onNewPost={() => setActiveTab("create")}
            connectedCount={aggregatedStats.connectedCount}
            totalCount={platforms.length}
          />

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
                onImageChange={(v) => {
                  setSelectedImage(v);
                  if (!v) setSelectedImageFile(null);
                }}
                onFileSelected={setSelectedImageFile}
                selectedPlatforms={selectedPlatforms}
                onTogglePlatform={togglePlatform}
                onToggleAllPlatforms={toggleAllPlatforms}
                isPublishing={isPublishing}
                onPublish={() => handlePublishNow()}
                onSchedule={handlePublishNow}
                previewPlatform={previewPlatform}
                onPreviewPlatformChange={setPreviewPlatform}
              />
            )}

            {activeTab === "scheduled" && (
              <ScheduledTab
                posts={posts}
                platforms={platforms}
                onPublishNow={handlePublishScheduledNow}
                onCancel={setDeleteModalPost}
                onCreateNew={() => setActiveTab("create")}
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
                onDateRangeChange={(v) => {
                  setDateRange(v);
                  setCustomFrom("");
                  setCustomTo("");
                }}
                customFrom={customFrom}
                customTo={customTo}
                onCustomFromChange={(v) => {
                  setCustomFrom(v);
                  setDateRange("ALL");
                }}
                onCustomToChange={(v) => {
                  setCustomTo(v);
                  setDateRange("ALL");
                }}
                onShowStats={setStatsModalPost}
                onDelete={setDeleteModalPost}
                onPublishNow={handlePublishScheduledNow}
                onResetFilters={() => {
                  setPlatformFilter("ALL");
                  setStatusFilter("ALL");
                  setSearchQuery("");
                  setDateRange("ALL");
                  setCustomFrom("");
                  setCustomTo("");
                }}
              />
            )}

            {activeTab === "auth" && (
              <ApiVaultTab
                platforms={platforms}
                userEmail={userEmail}
                onLogout={handleLogout}
                onCredentialsChanged={() => loadPlatforms()}
                onError={(message) => showToast(message, "error")}
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
        <StatsModal
          post={statsModalPost}
          platforms={platforms}
          onClose={() => setStatsModalPost(null)}
          onRefresh={handleRefreshStats}
        />
      )}
    </div>
  );
}
