function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
export {
  getErrorMessage as g
};
