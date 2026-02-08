/// API base URL. For Android emulator use 10.0.2.2:3000.
/// For physical device use your machine's IP (e.g. http://192.168.1.x:3000).
const String kApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3000',
);
