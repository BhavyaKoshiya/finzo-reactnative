/**
 * Rewarded Ad Session Manager.
 * Tracks unique local rewarded ad attempts to prevent duplicate completions,
 * replay attacks, or direct reward function calls without active playback.
 *
 * STRICT PRIVACY GUARANTEE: Session state is 100% local in-memory.
 * It is NEVER uploaded to Firebase, external servers, or tracked as user analytics.
 */
export const SESSION_STATES = {
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  REWARDED: 'REWARDED',
};

class RewardedAdSessionManager {
  constructor() {
    this.activeSessionId = null;
    this.sessions = new Map();
  }

  /**
   * Generates and starts a unique local rewarded ad session.
   * @param {string} placementId
   * @returns {string} sessionId
   */
  startSession(placementId = 'default_rewarded') {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const sessionId = `rwd_sess_${timestamp}_${randomStr}`;

    const sessionObj = {
      id: sessionId,
      placementId,
      status: SESSION_STATES.STARTED,
      startedAt: new Date(timestamp).toISOString(),
      completedAt: null,
      rewardedAt: null,
    };

    this.activeSessionId = sessionId;
    this.sessions.set(sessionId, sessionObj);

    return sessionId;
  }

  /**
   * Marks an active session as COMPLETED (video playback finished).
   * @param {string} sessionId
   * @returns {boolean} success
   */
  completeSession(sessionId) {
    const targetId = sessionId || this.activeSessionId;
    if (!targetId || !this.sessions.has(targetId)) {
      return false;
    }

    const session = this.sessions.get(targetId);
    if (session.status !== SESSION_STATES.STARTED) {
      return false; // Already finished, completed, or cancelled
    }

    session.status = SESSION_STATES.COMPLETED;
    session.completedAt = new Date().toISOString();
    return true;
  }

  /**
   * Marks an active session as CANCELLED (user dismissed video early).
   * @param {string} sessionId
   */
  cancelSession(sessionId) {
    const targetId = sessionId || this.activeSessionId;
    if (!targetId || !this.sessions.has(targetId)) {
      return;
    }

    const session = this.sessions.get(targetId);
    session.status = SESSION_STATES.CANCELLED;
    if (this.activeSessionId === targetId) {
      this.activeSessionId = null;
    }
  }

  /**
   * Marks a session as FAILED (playback error).
   * @param {string} sessionId
   */
  failSession(sessionId) {
    const targetId = sessionId || this.activeSessionId;
    if (!targetId || !this.sessions.has(targetId)) {
      return;
    }

    const session = this.sessions.get(targetId);
    session.status = SESSION_STATES.FAILED;
    if (this.activeSessionId === targetId) {
      this.activeSessionId = null;
    }
  }

  /**
   * Atomically claims reward for a completed session.
   * STRICT SECURITY GUARANTEE: Can ONLY claim reward if session status === COMPLETED.
   * Once claimed, session transitions to REWARDED to prevent duplicate claims.
   *
   * @param {string} sessionId
   * @returns {{ success: boolean, reason?: string, session?: Object }}
   */
  claimRewardForSession(sessionId) {
    const targetId = sessionId || this.activeSessionId;
    if (!targetId || !this.sessions.has(targetId)) {
      return { success: false, reason: 'Invalid or expired rewarded session ID' };
    }

    const session = this.sessions.get(targetId);

    if (session.status === SESSION_STATES.REWARDED) {
      return { success: false, reason: 'Reward has already been claimed for this session' };
    }

    if (session.status !== SESSION_STATES.COMPLETED) {
      return { success: false, reason: `Cannot claim reward for session in state: ${session.status}` };
    }

    // Atomically transition state to REWARDED
    session.status = SESSION_STATES.REWARDED;
    session.rewardedAt = new Date().toISOString();
    this.activeSessionId = null;

    return {
      success: true,
      session,
    };
  }

  /**
   * Resets all local session state (for development/testing).
   */
  reset() {
    this.activeSessionId = null;
    this.sessions.clear();
  }

  /**
   * Inspection helper for tests.
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
}

export const rewardedAdSessionManager = new RewardedAdSessionManager();
export default rewardedAdSessionManager;
