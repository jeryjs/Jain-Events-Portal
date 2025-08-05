# data-store Branch

This branch serves as a centralized repository for JSON files and other data assets used by sub-activities within the Jain Events Portal project. It is an orphan branch, meaning it is independent from the main project code and contains only data resources.

## Structure

```
activities/
  activity1.json
  activity2.json
articles/
  article1.json
  article2.json
events/
  event1.json
  event2.json
misc/
  other-data.json
README.md
```

- **activities/**: JSON files related to activities.
- **articles/**: JSON files for articles.
- **events/**: JSON files for events.
- **misc/**: Other supporting data files.

## Usage

- Reference these data files in your sub-activities or services as needed.
- Keep data organized in their respective folders for maintainability.
- Update or add new data files as required by project features.

## Notes

- This branch does not contain any application code.
- The `.gitignore` is configured to exclude project source folders and build artifacts.
- If you add new data categories, create a corresponding folder for clarity.
