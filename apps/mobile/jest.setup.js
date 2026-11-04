// Armazenamento em memória no lugar do AsyncStorage nativo durante os testes.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
