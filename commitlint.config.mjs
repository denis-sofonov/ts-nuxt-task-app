// Enforces Conventional Commits on the commit-msg hook (and feeds the same
// rules to the cz-git interactive prompt).
export default {
  extends: ['@commitlint/config-conventional'],
}
