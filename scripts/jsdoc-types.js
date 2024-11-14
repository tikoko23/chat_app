/**
 * @module types
 * @typedef {Object} File
 * @property {string} path
 */

/**
 * @module types
 * @typedef {"video" | "audio" | "image" | "archive" | "text" | "binary"} AttachmentType
 */

/**
 * @module types
 * @typedef {File} Attachment
 * @property {AttachmentType} type
 */

/**
 * @module types
 * @typedef {Object} MessageContent
 * @property {string} body
 */

/**
 * @module types
 * @typedef {Object} ResponseUser
 * @property {number} id
 * @property {string} name
 * @property {string | null} displayName
 * @property {string | undefined} createdAt
 * @property {string | undefined} email
 */

/**
 * @module types
 * @typedef {Object} ResponseGroup
 * @property {number} id
 * @property {string} name
 * @property {ResponseUser | null} owner
 */

/**
 * @module types
 * @typedef {Object} ResponseMessage
 * @property {number} id
 * @property {ResponseGroup} group
 * @property {ResponseUser} author
 * @property {number | null} replyId
 * @property {MessageContent} content
 * @property {string} createdAt
 * @property {Array<Attachment>} attachments
 * @property {string | null} editedAt
 */