import { Article } from "@common/models";
import Activity from "@common/models/Activity";
import Event from "@common/models/Event";
import { parseActivities, parseArticles, parseEvents } from "@common/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import config from "../config";
import queryClient from "@utils/QueryClient";

/*
 * Events API
 */

const _fetchEvents = async (): Promise<Event[]> => {
	const response = await fetch(`${config.API_BASE_URL}/events`, {
		headers: {
			"Cache-Control": "max-age=300", // 5 minutes
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch events");
	}

	const data: any = await response.json();
	return parseEvents(data);
};

const _fetchEvent = async (eventId: string): Promise<Event> => {
	const response = await fetch(`${config.API_BASE_URL}/events/${eventId}`, {
		headers: {
			"Cache-Control": "max-age=300", // 5 minutes
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch event: ${eventId}`);
	}

	const data: any = await response.json();
	return Event.parse(data);
};

export const useEvents = () => {
	if (process.env.NODE_ENV === "development") {
		// return useDummyEvents(20); // Use dummy events for now while testing
	}

	return useQuery({
		queryKey: ["events"],
		queryFn: _fetchEvents,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useEvent = (eventId: string) => {
	if (process.env.NODE_ENV === "development") {
		// const eventsQuery = useEvents();
	}

	return useQuery({
		queryKey: ["event", eventId],
		queryFn: () => _fetchEvent(eventId),
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!eventId,
	});
};

export const useDummyEvents = (count = 100) => {
	return useQuery({
		queryKey: ["dummy-events", count],
		queryFn: async () => {
			return fetch("/dummy_events.json")
				.then((res) => res.json())
				.then((data) => parseEvents(data).slice(0, count)) // Limit to the first `count` events
				.then((it) => new Promise<typeof it>((resolve) => setTimeout(() => resolve(it), 1000))); // Simulate network delay
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

/*
 * Activities API
 */

const _fetchActivities = async (eventId: string): Promise<Activity[]> => {
	const response = await fetch(`${config.API_BASE_URL}/activities/${eventId}`, {
		headers: {
			"Cache-Control": "max-age=60", // 1 minute
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch activities for event: ${eventId}`);
	}

	const data: any = await response.json();
	return parseActivities(data);
};

const _fetchActivity = async (eventId: string, activityId: string): Promise<Activity> => {
	const response = await fetch(`${config.API_BASE_URL}/activities/${eventId}/${activityId}`, {
		headers: {
			"Cache-Control": "max-age=60", // 1 minute
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch activity: ${activityId}`);
	}

	const data: any = await response.json();
	return Activity.parse(data);
};

export const useActivities = (eventId: string) => {
	if (process.env.NODE_ENV === "development") {
		// return useDummyActivities(eventId, 20); // Use dummy activities for now while testing
	}

	return useQuery({
		queryKey: ["activities", eventId],
		queryFn: () => _fetchActivities(eventId),
		// staleTime: 1000 * 60 * 5, // 5 minutes
		refetchInterval: (data) => {
			if (!data || !data.state.data) return false;

			// Check if any activities are ongoing
			const hasOngoingActivities = data.state.data.some((activity) => {
				return activity.isOngoing;
			});

			// Only refetch if there's at least one ongoing activity
			return hasOngoingActivities ? 60000 : false;
		},
	});
};

export const useActivity = (eventId: string, activityId: string) => {
	if (process.env.NODE_ENV === "development") {
		// return useDummyActivity(eventId, activityId); // Use dummy activity for now while testing
	}
	// const activitiesQuery = useActivities(eventId);

	return useQuery({
		queryKey: ["activity", eventId, activityId],
		queryFn: () => _fetchActivity(eventId, activityId),
		// staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!eventId && !!activityId,
		refetchInterval: (data) => {
			if (!data || !data.state.data) return false;

			// Check if this specific activity is ongoing
			const activity = data.state.data;
			const isOngoing = activity.isOngoing;

			// Only refetch if this activity is ongoing
			return isOngoing ? 60000 : false;
		},
	});
};

export const useCastVote = (eventId: string, activityId: string) => {
	return useMutation({
		mutationKey: ["castVote", eventId, activityId],
		mutationFn: async (teamId: string) => {
			const response = await fetch(`${config.API_BASE_URL}/activities/${eventId}/${activityId}/vote/${teamId}`, {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
					"Content-Type": "application/json",
					"Cache-Control": "no-cache",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to cast vote");
			}

			return response.json();
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activity", eventId, activityId] }),
	});
};

const useDummyActivities = (eventId: string, count = 30) => {
	return useQuery({
		queryKey: ["dummy_activities", eventId, count],
		queryFn: async () => {
			return fetch("/dummy_activities.json")
				.then((res) => res.json())
				.then((data) => parseActivities(data).slice(0, count)) // Limit to the first `count` activities
				.then((it) => new Promise<typeof it>((resolve) => setTimeout(() => resolve(it), 1000))); // Simulate network delay
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});
};

const useDummyActivity = (eventId: string, activityId: string) => {
	return useQuery({
		queryKey: ["dummy_activity", eventId, activityId],
		queryFn: async () => {
			return fetch("/dummy_activities.json")
				.then((res) => res.json())
				.then((data) => parseActivities(data).find((a) => a.id === activityId))
				.then((it) => new Promise<typeof it>((resolve) => setTimeout(() => resolve(it), 1000))); // Simulate network delay
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: true,
	});
};

/*
 * Articles API
 */

const _fetchArticles = async (): Promise<Article[]> => {
	const response = await fetch(`${config.API_BASE_URL}/articles`, {
		headers: {
			"Cache-Control": "max-age=1800", // 30 minutes
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch articles");
	}

	const data: any = await response.json();
	return data.map((article: any) => Article.parse(article));
};

export const useArticles = () => {
	if (process.env.NODE_ENV === "development") {
		// return useDummyArticles(20); // Use dummy articles for now while testing
	}

	return useQuery({
		queryKey: ["articles"],
		queryFn: _fetchArticles,
		staleTime: 1000 * 60 * 30, // 30 minutes
		refetchOnWindowFocus: false,
	});
};

export const useArticle = (articleId: string) => {
	const articlesQuery = useArticles();

	return useQuery({
		queryKey: ["article", articleId],
		queryFn: async () => articlesQuery.data?.find((a) => a.id === articleId),
		staleTime: 1000 * 60 * 30, // 30 minutes
		enabled: !articlesQuery.isLoading,
	});
};

const useDummyArticles = (count = 30) => {
	return useQuery({
		queryKey: ["dummy_articles", count],
		queryFn: async () => {
			return fetch("/dummy_articles.json")
				.then((res) => res.json())
				.then((data) => parseArticles(data).slice(0, count)) // Limit to the first `count` articles
				.then((it) => new Promise<typeof it>((resolve) => setTimeout(() => resolve(it), 1000))); // Simulate network delay
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});
};

// Custom hook to update article view count
export const useUpdateArticleViewCount = () => {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const STORAGE_KEY = "articleViews";

	const getArticleViews = (): Record<string, number> => {
		const item = localStorage.getItem(STORAGE_KEY);
		try { return item ? JSON.parse(item) : {} }
		catch { return {} }
	};

	const setArticleViews = (views: Record<string, number>) =>
		localStorage.setItem(STORAGE_KEY, JSON.stringify(views));

	useEffect(() => () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
	}, []);

	const updateViewCount = (articleId: string) => {
		if (!articleId) return;

		const views = getArticleViews();
		const lastViewed = views[articleId];

		if (lastViewed && lastViewed > Date.now() - 30 * 60 * 1000) {
			console.log("updateViewCount: Article already viewed.");
			return;
		}

		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(async () => {
			try {
				await fetch(`${config.API_BASE_URL}/articles/${articleId}/view`, {
					method: "POST",
				});
				console.log("View count updated for article:", articleId);

				setArticleViews({ ...getArticleViews(), [articleId]: Date.now() });
			} catch (error) {
				console.error("Failed to update article view count:", error);
			} finally {
				timeoutRef.current = null;
			}
		}, 10000);
	};

	return { updateViewCount };
};
