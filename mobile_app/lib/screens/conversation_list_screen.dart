import 'package:flutter/material.dart';

import '../models/conversation.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/conversation_service.dart';
import '../theme/app_theme.dart';
import '../utils/error_utils.dart';
import 'chat_screen.dart';

class ConversationListScreen extends StatefulWidget {
  const ConversationListScreen({super.key});

  @override
  State<ConversationListScreen> createState() => _ConversationListScreenState();
}

class _ConversationListScreenState extends State<ConversationListScreen> {
  List<Conversation> _convs = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final token = await AuthService().getAccessToken();
    if (token != null) apiClient.setToken(token);
    setState(() => _loading = true);
    final res = await fetchConversations();
    if (!mounted) return;
    setState(() {
      _loading = false;
      if (res.success && res.data != null) {
        _convs = List<Conversation>.from(res.data as List? ?? []);
      } else {
        _error = res.error ?? 'Failed to load';
      }
    });
  }

  Future<void> _confirmDelete(Conversation c) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete chat'),
        content: Text('Delete "${c.displayTitle}"? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppTheme.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok == true && mounted) await _delete(c.id);
  }

  Future<void> _delete(String id) async {
    final res = await archiveConversation(id);
    if (!mounted) return;
    if (res.success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Chat deleted')));
      _load();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res.error ?? 'Failed to delete')));
    }
  }

  Future<void> _createAndOpen() async {
    final res = await createConversation();
    if (!mounted) return;
    if (res.success && res.data != null) {
      final d = res.data as Map<String, dynamic>;
      final conv = d['conversation'] as Map<String, dynamic>?;
      if (conv != null) {
        final c = Conversation.fromJson(conv);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ChatScreen(conversationId: c.id),
          ),
        ).then((_) => _load());
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res.error ?? 'Failed to create')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _createAndOpen),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.cloud_off, size: 48, color: AppTheme.onSurfaceMuted),
                        const SizedBox(height: 16),
                        Text(
                          formatApiError(_error),
                          style: Theme.of(context).textTheme.bodyLarge,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        FilledButton.icon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : _convs.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.chat_bubble_outline, size: 64, color: AppTheme.onSurfaceMuted),
                          const SizedBox(height: 16),
                          Text('No conversations yet', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 8),
                          Text('Start a new chat to ask questions', style: Theme.of(context).textTheme.bodyMedium),
                          const SizedBox(height: 24),
                          FilledButton.icon(
                            onPressed: _createAndOpen,
                            icon: const Icon(Icons.add),
                            label: const Text('New chat'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _convs.length,
                        itemBuilder: (_, i) {
                          final c = _convs[i];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: const Icon(Icons.chat_bubble_outline, color: AppTheme.primary),
                              title: Text(c.displayTitle),
                              subtitle: Text(_formatDate(c.updatedAt)),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, color: AppTheme.error),
                                    onPressed: () => _confirmDelete(c),
                                  ),
                                  const Icon(Icons.chevron_right),
                                ],
                              ),
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ChatScreen(conversationId: c.id),
                                ),
                              ).then((_) => _load()),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inDays == 0) return 'Today';
      if (diff.inDays == 1) return 'Yesterday';
      if (diff.inDays < 7) return '${diff.inDays} days ago';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return iso;
    }
  }
}
