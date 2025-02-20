/**
 * @file backend/constants.js
 * @description This file re-exports constants defined in the common module.
 * It serves as a centralized location for accessing shared constants within the backend,
 * promoting code reuse and consistency across different backend modules. By re-exporting,
 * backend modules can import constants from a single, well-known path, rather than
 * directly importing from the common module. This abstraction can be useful for
 * decoupling the backend from the common module's specific file structure, allowing
 * for easier refactoring and maintenance.
 */

const constants = require("../common/constants")

module.exports = {
    ...constants
}