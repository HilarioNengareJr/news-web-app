/**
 * @license MIT
 * @copyright Hilario Junior Nengare 2025
 */

/**
 * node modules
 */
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        user?: {
            id: string;
            username: string;
            isAdmin: boolean;
        }
    }
}