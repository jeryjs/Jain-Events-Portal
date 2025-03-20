
/**
 * Represents the different types of events available in the system.
 *
 * @remarks
 * Each base type is identified by an enum value that is divisible by 1000.
 * Enum values that are increments of a base type represent specific sub-categories.
 *
 * For example:
 * - A value of 1000 (e.g., SPORTS) is a base type.
 * - A value of 1001 (e.g., BASKETBALL) is a sub-type under the SPORTS base type.
 */
export enum EventType {
	GENERAL = 0,
	INFO = 1,

	SPORTS = 1000,
	BASKETBALL = 1001,
	FOOTBALL = 1002,
	CRICKET = 1003,
	VOLLEYBALL = 1004,
	THROWBALL = 1005,
	ATHLETICS = 1006,

	CULTURAL = 2000,
	DANCE = 2001,
	SINGING = 2002,
	DJ = 2003,

	TECH = 3000,
	CODING = 3001,
	HACKATHON = 3002,
	QUIZ = 3003,
	WORKSHOP = 3004,

	NSS = 4000,
}

export enum ArticleStatus {
	DRAFT = "draft",
	PUBLISHED = "published",
	ARCHIVED = "archived",
}

export enum Role {
	GUEST = 0, // Lowest privileges
	USER = 1,
	MANAGER = 2,
	ADMIN = 3, // Highest privileges
}

export enum Gender {
	MALE = "male",
	FEMALE = "female",
	OTHER = "other",
}
