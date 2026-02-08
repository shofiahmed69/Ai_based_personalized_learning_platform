import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../models/document.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/document_service.dart';
import '../theme/app_theme.dart';
import 'document_detail_screen.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  List<Document> _docs = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTokenAndFetch();
  }

  Future<void> _loadTokenAndFetch() async {
    final token = await AuthService().getAccessToken();
    if (token != null) apiClient.setToken(token);
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await fetchDocuments();
    if (!mounted) return;
    setState(() {
      _loading = false;
      if (res.success && res.data != null) {
        final d = res.data as Map<String, dynamic>;
        _docs = (d['items'] as List<dynamic>?)?.cast<Document>() ?? [];
      } else {
        _error = res.error ?? 'Failed to load documents';
      }
    });
  }

  Future<void> _upload() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'txt', 'md'],
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.single;
    final path = file.path;
    if (path == null) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cannot access file')));
      return;
    }
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Uploading...')));
    final res = await uploadDocument(path, file.name);
    if (!mounted) return;
    if (res.success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Upload started')));
      _fetch();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res.error ?? 'Upload failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Documents'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.upload_file), onPressed: _upload),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetch),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: Theme.of(context).textTheme.bodyLarge, textAlign: TextAlign.center),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: _fetch,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _docs.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.folder_open, size: 64, color: AppTheme.onSurfaceMuted),
                          const SizedBox(height: 16),
                          Text('No documents yet', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 8),
                          Text('Tap + to upload a PDF or document', style: Theme.of(context).textTheme.bodyMedium),
                          const SizedBox(height: 24),
                          FilledButton.icon(
                            onPressed: _upload,
                            icon: const Icon(Icons.upload_file),
                            label: const Text('Upload document'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetch,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _docs.length,
                        itemBuilder: (_, i) {
                          final doc = _docs[i];
                          return _DocumentTile(
                            document: doc,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => DocumentDetailScreen(documentId: doc.id),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

class _DocumentTile extends StatelessWidget {
  final Document document;
  final VoidCallback onTap;

  const _DocumentTile({required this.document, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.primary.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(_iconForType(document.fileType), color: AppTheme.primary, size: 24),
        ),
        title: Text(document.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(document.statusDisplay),
        trailing: document.isProcessing
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'PDF':
        return Icons.picture_as_pdf;
      case 'DOCX':
        return Icons.description;
      default:
        return Icons.insert_drive_file;
    }
  }
}
