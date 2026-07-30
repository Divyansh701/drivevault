/**
 * Controller barrel export.
 *
 * Controllers are thin — they parse the HTTP request, delegate to a use case,
 * and format the HTTP response. No business logic lives here.
 */

export { AuthController }    from './AuthController';
export { VehicleController } from './VehicleController';
