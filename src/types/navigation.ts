import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  DeckSelection: undefined;
  ReadingSetup: undefined; // TODO: TO BUILD
  ReadingTable: { spreadId: string }; // TODO: TO BUILD
  Settings: undefined;
};