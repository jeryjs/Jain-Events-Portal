import { Article, UserData } from "@common/models";
import Activity from "@common/models/Activity";
import Event from "@common/models/Event";
import { parseActivities, parseArticles, parseEvents } from "@common/utils";
import { useLogin } from "@components/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import queryClient from "@utils/QueryClient";
import { useCallback, useEffect, useRef } from "react";
import * as admin from "./admin"; // Import admin API hooks
import config from "../config";

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
		// return useDummyEvents(200); // Use dummy events for now while testing
	}

	return admin.useEvents();
};

export const useEvent = (eventId: string) => {
	if (process.env.NODE_ENV === "development") {
		// return useDummyEvent(eventId); // Use dummy event for now while testing
	}

	return admin.useEvent(eventId);
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

export const useDummyEvent = (eventId: string) => {
	return useQuery({
		queryKey: ["dummy-event", eventId],
		queryFn: async () => {
			return fetch("/dummy_events.json")
				.then((res) => res.json())
				.then((data) => parseEvents(data).find((e) => e.id === eventId))
				.then((it) => new Promise<typeof it>((resolve) => setTimeout(() => resolve(it), 1000))); // Simulate network delay
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: true,
	});
}

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

	return admin.useEventActivities(eventId);
};

export const useActivity = (eventId: string, activityId: string) => {
	if (process.env.NODE_ENV === "development") {
		// return useDummyActivity(eventId, activityId); // Use dummy activity for now while testing
	}
	// const activitiesQuery = useActivities(eventId);

	return admin.useActivity(eventId, activityId);
};

export const useCastVote = (eventId: string, activityId: string) => {
	const { token } = useLogin();

	return useMutation({
		mutationKey: ["castVote", eventId, activityId],
		mutationFn: async (teamId: string) => {
			if (!token) {
				throw new Error("You must be signed in to vote");
			}

			const response = await fetch(`${config.API_BASE_URL}/activities/${eventId}/${activityId}/vote/${teamId}`, {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json",
					"Cache-Control": "no-cache",
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData?.message || "Failed to cast vote");
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

	return admin.useArticles();
};

export const useArticle = (articleId: string) => {
	// const articlesQuery = useArticles();

	return admin.useArticle(articleId);
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


/**
 * useSession - fetches backend session user info using Firebase ID token
 * @returns { getSession: (idToken: string) => Promise<UserData | null> }
 */
export const useSession = () => {
	// Returns a function to fetch session info from backend
	const getSession = useCallback(async (idToken: string): Promise<UserData | null> => {
		try {
			const resp = await fetch(`${config.API_BASE_URL}/user/session`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: 'include', // Important: This allows the session cookie to be set
				body: JSON.stringify({ idToken })
			});
			if (!resp.ok) throw new Error("Failed to fetch session");
			const { user: backendUser } = await resp.json();
			return backendUser;
		} catch (e) {
			return null;
		}
	}, []);
	return { getSession };
};


/**
 * useAssignManagers - returns a mutation to assign managers to an event
 * Usage: const { mutateAsync: assignManagers, isLoading, error } = useAssignManagers();
 */
export const useAssignManagers = () => {
	return useMutation({
		mutationFn: async ({ eventId, managers }: { eventId: string, managers: string[] }) => {
			const resp = await fetch(`${config.API_BASE_URL}/events/${eventId}/managers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ managers })
			});
			if (!resp.ok) throw new Error("Failed to assign managers");
			return resp.json();
		}
	});
};
