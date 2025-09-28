import React from 'react'
import {
  Mail,
  FileText,
  Search,
  GitBranch,
  GitPullRequest,
  MessageSquare,
  FileCode,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Folder,
  Settings,
  Wrench
} from 'lucide-react'

export interface ToolIconProps {
  className?: string
}

export const toolIconMap: Record<string, React.ComponentType<ToolIconProps>> = {
  // Gmail tools
  'send_gmail_message': Mail,

  // Google Docs tools
  'create_google_doc': Plus,
  'read_google_doc_by_id': FileText,
  'read_google_doc_by_title': FileText,
  'search_google_docs': Search,

  // GitHub Issues
  'get_issues': MessageSquare,
  'get_issue': MessageSquare,
  'comment_on_issue': MessageSquare,
  'search_issues_and_pull_requests': Search,

  // GitHub Pull Requests
  'list_open_pull_requests_prs': GitPullRequest,
  'get_pull_request': GitPullRequest,
  'create_pull_request': GitPullRequest,
  'overview_of_files_included_in_pr': GitPullRequest,
  'list_pull_requests_files': GitPullRequest,
  'create_review_request': Users,

  // GitHub File Operations
  'create_file': Plus,
  'read_file': Eye,
  'update_file': Edit,
  'delete_file': Trash2,
  'overview_of_existing_files_in_main_branch': Folder,
  'overview_of_files_in_current_working_branch': Folder,
  'get_files_from_a_directory': Folder,

  // GitHub Branch Operations
  'list_branches_in_this_repository': GitBranch,
  'set_active_branch': GitBranch,
  'create_a_new_branch': GitBranch,

  // GitHub Search
  'search_code': FileCode,

  // Generic fallback
  'default': Wrench,
}

export const getToolIcon = (toolName: string): React.ComponentType<ToolIconProps> => {
  // First try exact match
  if (toolIconMap[toolName]) {
    return toolIconMap[toolName]
  }

  // Then try partial matches for common patterns
  const lowerToolName = toolName.toLowerCase()

  if (lowerToolName.includes('gmail') || lowerToolName.includes('mail')) {
    return Mail
  }
  if (lowerToolName.includes('doc') || lowerToolName.includes('document')) {
    return FileText
  }
  if (lowerToolName.includes('search')) {
    return Search
  }
  if (lowerToolName.includes('pull_request') || lowerToolName.includes('pr')) {
    return GitPullRequest
  }
  if (lowerToolName.includes('branch')) {
    return GitBranch
  }
  if (lowerToolName.includes('issue')) {
    return MessageSquare
  }
  if (lowerToolName.includes('file')) {
    return FileCode
  }
  if (lowerToolName.includes('create')) {
    return Plus
  }
  if (lowerToolName.includes('read') || lowerToolName.includes('get')) {
    return Eye
  }
  if (lowerToolName.includes('update') || lowerToolName.includes('edit')) {
    return Edit
  }
  if (lowerToolName.includes('delete')) {
    return Trash2
  }
  if (lowerToolName.includes('folder') || lowerToolName.includes('directory')) {
    return Folder
  }

  // Fallback to default tool icon
  return toolIconMap.default
}