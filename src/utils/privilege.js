export default function (thread, role) {
  if(thread.admin) {
    return true;
  }
  if (thread.roles) {
    if (thread.roles.indexOf(role) > -1) {
      return true;
    }
  }
}

export function isOwner(thread, user) {
  return thread.inviter && user.id === thread.inviter.id;
}