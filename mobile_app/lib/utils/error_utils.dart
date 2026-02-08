/// Formats API/network errors into user-friendly messages.
String formatApiError(String? error) {
  if (error == null || error.isEmpty) return 'Something went wrong';
  if (error.contains('Connection refused') || error.contains('SocketException')) {
    return 'Cannot connect to server.\n\n'
        'Make sure:\n'
        '• Backend is running (npm run dev)\n'
        '• Phone and computer are on the same WiFi\n'
        '• Firewall allows port 3000';
  }
  if (error.contains('Connection timed out') || error.contains('TimeoutException')) {
    return 'Request timed out. Check your connection and try again.';
  }
  if (error.contains('Invalid') && error.contains('token')) {
    return 'Session expired. Please log in again.';
  }
  return error.length > 200 ? '${error.substring(0, 200)}...' : error;
}
