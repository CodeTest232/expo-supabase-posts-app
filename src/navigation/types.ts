import { NavigatorScreenParams } from '@react-navigation/native';
import { RootStackParamList, RootTabParamList } from '../types';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  CreatePost: undefined;
  MyPosts: undefined;
};
