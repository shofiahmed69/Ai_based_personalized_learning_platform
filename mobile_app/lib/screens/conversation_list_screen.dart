import 'package:flutter/material.dart';

import '../models/conversation.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/conversation_service.dart';
import '../theme/app_theme.dart';
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
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: Theme.of(context).textTheme.bodyLarge),
                      const SizedBox(height: 16),
                      FilledButton.icon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text('Retry')),
                    ],
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
                              trailing: const Icon(Icons.chevron_right),
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
