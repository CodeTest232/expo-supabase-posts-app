import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Card, Button } from '../components';
import { postService } from '../services/postService';
import { useAuthStore } from '../store';
import { Post } from '../types';
import { formatRelativeTime } from '../utils';

interface MyPostsScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    jumpTo?: (screen: string) => void;
  };
  route?: {
    params?: {
      refresh?: boolean;
    };
  };
}

const MyPostsScreen: React.FC<MyPostsScreenProps> = ({ navigation, route }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { signOut, user } = useAuthStore();

  const loadPosts = useCallback(async () => {
    try {
      const data = await postService.getMyPosts();
      setPosts(data);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to load posts'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postService.deletePost(postId);
              setPosts(posts.filter((p) => p.id !== postId));
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete post'
              );
            }
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postDate}>{formatRelativeTime(item.created_at)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.postImage} />
      )}
      <Text style={styles.postContent}>{item.content}</Text>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No posts yet</Text>
      <Text style={styles.emptySubtext}>Create your first post to get started</Text>
      <Button
        title="Create Post"
        onPress={() => navigation.navigate('CreatePost')}
        style={styles.emptyButton}
      />
    </View>
  );

  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Posts</Text>
          {user && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}
        </View>
        <View style={styles.headerBottom}>
          <View style={styles.buttonWrapper}>
            <Button
              title="+ New Post"
              onPress={() => navigation.navigate('CreatePost')}
              variant="primary"
              style={styles.newPostButton}
            />
          </View>
          <View style={styles.buttonWrapper}>
          <Button
            title="Logout"
            onPress={async () => {
              try {
                await signOut();
                Toast.show({
                  type: 'success',
                  text1: 'Logged Out',
                  text2: 'You have been logged out successfully',
                  position: 'top',
                  visibilityTime: 2000,
                });
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Logout Failed',
                  text2: 'Please try again',
                  position: 'top',
                });
              }
            }}
            variant="outline"
            style={styles.logoutButton}
          />
          </View>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttonWrapper: {
    marginLeft: 8,
  },
  newPostButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default MyPostsScreen;

