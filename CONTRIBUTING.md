# Contributing Guidelines

Welcome to the Jain FET Hub project! This document outlines how to contribute in a manner that keeps the codebase clean, efficient and consistent.

## Project Setup
- Follow the instructions on this GitHub repo to get the project running: [Build Instructions](/README.md#build)
- Environment variables:
  - `PORT=5000`
  - `JWT_SECRET=[its provided in the whatsapp group]`
  - `FIREBASE_ACCOUNT_KEY_JSON=[ignore this for now]`

## Code Standards & Design
- **UI Components:** Use Material-UI (MUI) for all UI elements. Refer to the [MUI Components](https://mui.com/material-ui/all-components/) documentation.
- **Component Reusability:** Promote the reuse of existing components to maintain consistency and reduce redundancy.
- **Consistent Design:** Maintain consistency throughout the app by following the MUI design guidelines.
- **External References:** Maintain a list of references for any external components adapted into the project.

## Development Process
- **Frontend Caching:** Implement caching mechanisms wherever possible in the frontend to improve performance and reduce unnecessary data fetching.
- **One-Page-One-Request:** Ensure every API call to the backend is optimized to make a single page-request to reduce system load.
- **Feature-Based Architecture:** Organize code by features. For example, create separate directories like `/src/pages/feature/FeatureScreen.jsx` for new functionalities.
- **Pull Requests:** Always create a pull request (PR) to the main branch. Avoid direct commits.
- **Code Reviews:** Ensure your PR includes clear descriptions and minimal hints so reviewers can merge changes easily.

## Additional Notes
- All assets should be prepared by ourselves or the design team (Avoid taking from online, which might cause issues when applying for patent).
- Maintain a list of references for any external components you take from online.
- Use the TODO.md files in sub-project directories (e.g., `/backend`, `/clientview`) to track TODOs.
  - Use a tick (✓) for completed items, a cross (✖) for items that are not planned, and a dash (—) for pending items (default).
- Update this document as new practices evolve.

Happy coding and thank you for contributing!
