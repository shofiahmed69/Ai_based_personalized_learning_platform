import 'package:flutter/material.dart';

import '../models/conversation.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/conversation_service.dart';
import '../theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  final String conversationId;

  const ChatScreen({super.key, required this.conversationId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  List<Message> _messages = [];
  Conversation? _conv;
  bool _loading = true;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final token = await AuthService().getAccessToken();
    if (token != null) apiClient.setToken(token);
    setState(() => _loading = true);
    final res = await fetchConversation(widget.conversationId);
    if (!mounted) return;
    setState(() {
      _loading = false;
      if (res.success && res.data != null) {
        final d = res.data as Map<String, dynamic>;
        _conv = d['conversation'] as Conversation?;
        _messages = ((d['messages'] as List<dynamic>?) ?? []).cast<Message>();
      }
    });
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;
    _controller.clear();
    setState(() => _sending = true);

    final userMsg = Message(
      id: '',
      conversationId: widget.conversationId,
      role: 'user',
      content: text,
      createdAt: DateTime.now().toIso8601String(),
    );
    setState(() => _messages = [..._messages, userMsg]);
    _scrollToBottom();

    final res = await sendMessage(widget.conversationId, text);
    if (!mounted) return;
    setState(() => _sending = false);

    if (res.success && res.data != null) {
      final d = res.data as Map<String, dynamic>;
      final msg = d['message'] as Map<String, dynamic>?;
      final assistantMsg = d['assistantMessage'] as Map<String, dynamic>?;
      if (assistantMsg != null) {
        setState(() => _messages = [..._messages, Message.fromJson(assistantMsg)]);
        _scrollToBottom();
      } else if (msg != null) {
        setState(() => _messages = [..._messages, Message.fromJson(msg)]);
      }
    } else {
      setState(() => _messages = _messages.sublist(0, _messages.length - 1));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.error ?? 'Failed to send')),
      );
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_conv?.displayTitle ?? 'Chat'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _messages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.chat_bubble_outline, size: 64, color: AppTheme.onSurfaceMuted),
                            const SizedBox(height: 16),
                            Text('Start a conversation', style: Theme.of(context).textTheme.titleMedium),
                            const SizedBox(height: 8),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 32),
                              child: Text(
                                'Ask questions about your documents. AI will respond.',
                                style: Theme.of(context).textTheme.bodyMedium,
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (_, i) {
                          final m = _messages[i];
                          return _MessageBubble(message: m);
                        },
                      ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppTheme.surfaceVariant),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: 'Type a message...',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      maxLines: 3,
                      minLines: 1,
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _sending ? null : _send,
                    icon: _sending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final Message message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
        decoration: BoxDecoration(
          color: isUser ? AppTheme.primary : AppTheme.surfaceVariant,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          message.content,
          style: TextStyle(color: isUser ? Colors.white : AppTheme.onSurface),
        ),
      ),
    );
  }
}
